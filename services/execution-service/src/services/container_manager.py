import asyncio
import time
import uuid
from typing import Dict, List, Optional
import docker
from docker.errors import ContainerError, ImageNotFound, APIError

from ..utils.logger import get_logger

logger = get_logger(__name__)

class ContainerManager:
    def __init__(self, docker_client):
        self.docker_client = docker_client
        self.active_containers: Dict[str, dict] = {}
        self.stats = {
            "total_executions": 0,
            "active_containers": 0,
            "total_execution_time": 0,
            "memory_usage": 0,
            "cpu_usage": 0
        }
        
        # Start cleanup task
        asyncio.create_task(self._periodic_cleanup())

    async def create_container(
        self,
        image: str,
        command: List[str],
        memory_limit: str = "128m",
        timeout: int = 30,
        execution_id: str = None,
        session_id: str = None
    ):
        """Create a new Docker container for code execution"""
        
        if not execution_id:
            execution_id = str(uuid.uuid4())
        
        try:
            # Ensure image is available
            await self._ensure_image_available(image)
            
            # Container configuration
            container_config = {
                "image": image,
                "command": command,
                "detach": True,
                "mem_limit": memory_limit,
                "memswap_limit": memory_limit,  # Prevent swap usage
                "cpu_quota": 50000,  # Limit CPU usage to 50%
                "cpu_period": 100000,
                "network_disabled": True,  # Disable network access
                "read_only": False,  # Allow writing to /app
                "working_dir": "/app",
                "volumes": {
                    # Create tmpfs for /app to allow writing
                    "/app": {"bind": "/app", "mode": "rw"}
                },
                "tmpfs": {
                    "/app": "rw,size=100m,uid=1000"
                },
                "security_opt": [
                    "no-new-privileges:true"
                ],
                "cap_drop": ["ALL"],
                "cap_add": ["CHOWN", "SETUID", "SETGID"],
                "user": "1000:1000",  # Run as non-root user
                "environment": {
                    "HOME": "/app",
                    "USER": "coderunner"
                },
                "labels": {
                    "execution_id": execution_id,
                    "session_id": session_id or "",
                    "created_at": str(time.time()),
                    "service": "code-execution"
                }
            }
            
            # Create container
            container = self.docker_client.containers.create(**container_config)
            
            # Store container info
            self.active_containers[execution_id] = {
                "container": container,
                "created_at": time.time(),
                "session_id": session_id,
                "timeout": timeout,
                "image": image
            }
            
            self.stats["active_containers"] = len(self.active_containers)
            self.stats["total_executions"] += 1
            
            logger.info(f"Created container {container.id[:12]} for execution {execution_id}")
            
            return container
            
        except Exception as e:
            logger.error(f"Failed to create container for execution {execution_id}: {str(e)}")
            raise

    async def _ensure_image_available(self, image: str):
        """Ensure Docker image is available locally"""
        
        try:
            self.docker_client.images.get(image)
        except ImageNotFound:
            logger.info(f"Pulling image {image}...")
            try:
                self.docker_client.images.pull(image)
                logger.info(f"Successfully pulled image {image}")
            except Exception as e:
                logger.error(f"Failed to pull image {image}: {str(e)}")
                raise

    async def cleanup_container(self, execution_id: str):
        """Clean up a specific container"""
        
        if execution_id not in self.active_containers:
            return
        
        try:
            container_info = self.active_containers[execution_id]
            container = container_info["container"]
            
            # Stop container if running
            try:
                container.stop(timeout=5)
            except:
                pass
            
            # Remove container
            try:
                container.remove(force=True)
            except:
                pass
            
            # Update stats
            execution_time = time.time() - container_info["created_at"]
            self.stats["total_execution_time"] += execution_time
            
            # Remove from active containers
            del self.active_containers[execution_id]
            self.stats["active_containers"] = len(self.active_containers)
            
            logger.info(f"Cleaned up container for execution {execution_id}")
            
        except Exception as e:
            logger.error(f"Failed to cleanup container {execution_id}: {str(e)}")

    async def cleanup_session_containers(self, session_id: str):
        """Clean up all containers for a specific session"""
        
        containers_to_cleanup = []
        
        for execution_id, container_info in self.active_containers.items():
            if container_info.get("session_id") == session_id:
                containers_to_cleanup.append(execution_id)
        
        for execution_id in containers_to_cleanup:
            await self.cleanup_container(execution_id)
        
        logger.info(f"Cleaned up {len(containers_to_cleanup)} containers for session {session_id}")

    async def cleanup_all_containers(self):
        """Clean up all active containers"""
        
        execution_ids = list(self.active_containers.keys())
        
        for execution_id in execution_ids:
            await self.cleanup_container(execution_id)
        
        logger.info(f"Cleaned up all {len(execution_ids)} active containers")

    async def _periodic_cleanup(self):
        """Periodically clean up expired containers"""
        
        while True:
            try:
                current_time = time.time()
                expired_containers = []
                
                for execution_id, container_info in self.active_containers.items():
                    # Check if container has exceeded its timeout
                    age = current_time - container_info["created_at"]
                    if age > container_info["timeout"] + 30:  # Grace period
                        expired_containers.append(execution_id)
                
                # Clean up expired containers
                for execution_id in expired_containers:
                    logger.warning(f"Cleaning up expired container {execution_id}")
                    await self.cleanup_container(execution_id)
                
                # Clean up orphaned containers
                await self._cleanup_orphaned_containers()
                
            except Exception as e:
                logger.error(f"Error in periodic cleanup: {str(e)}")
            
            # Wait 60 seconds before next cleanup
            await asyncio.sleep(60)

    async def _cleanup_orphaned_containers(self):
        """Clean up containers that may have been left behind"""
        
        try:
            # Get all containers with our service label
            containers = self.docker_client.containers.list(
                all=True,
                filters={"label": "service=code-execution"}
            )
            
            current_time = time.time()
            
            for container in containers:
                try:
                    created_at = float(container.labels.get("created_at", 0))
                    age = current_time - created_at
                    
                    # Remove containers older than 5 minutes
                    if age > 300:
                        execution_id = container.labels.get("execution_id", "unknown")
                        logger.warning(f"Removing orphaned container {container.id[:12]} (execution: {execution_id})")
                        
                        container.stop(timeout=5)
                        container.remove(force=True)
                        
                except Exception as e:
                    logger.error(f"Failed to cleanup orphaned container {container.id[:12]}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Failed to cleanup orphaned containers: {str(e)}")

    async def get_stats(self) -> Dict:
        """Get container manager statistics"""
        
        # Calculate average execution time
        avg_execution_time = 0
        if self.stats["total_executions"] > 0:
            avg_execution_time = self.stats["total_execution_time"] / self.stats["total_executions"]
        
        # Get current resource usage
        total_memory = 0
        total_cpu = 0
        
        for container_info in self.active_containers.values():
            try:
                container = container_info["container"]
                stats = container.stats(stream=False)
                
                # Memory usage
                memory_usage = stats["memory_stats"].get("usage", 0)
                total_memory += memory_usage
                
                # CPU usage (simplified)
                cpu_stats = stats.get("cpu_stats", {})
                cpu_usage = cpu_stats.get("cpu_usage", {}).get("total_usage", 0)
                total_cpu += cpu_usage
                
            except Exception:
                pass
        
        return {
            "active_containers": self.stats["active_containers"],
            "total_executions": self.stats["total_executions"],
            "average_execution_time": avg_execution_time,
            "memory_usage": total_memory,
            "cpu_usage": total_cpu,
            "uptime": time.time()
        }

    async def get_container_logs(self, execution_id: str) -> str:
        """Get logs from a specific container"""
        
        if execution_id not in self.active_containers:
            return "Container not found"
        
        try:
            container = self.active_containers[execution_id]["container"]
            logs = container.logs(stdout=True, stderr=True, timestamps=True)
            return logs.decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to get logs for container {execution_id}: {str(e)}")
            return f"Error retrieving logs: {str(e)}"
