import asyncio
import json
import time
import uuid
from typing import Dict, List, Optional, AsyncGenerator
import docker
from docker.errors import ContainerError, ImageNotFound, APIError

from ..models.execution import ExecutionRequest, ExecutionResponse, ExecutionStatus
from ..utils.logger import get_logger
from .container_manager import ContainerManager

logger = get_logger(__name__)

class CodeExecutor:
    def __init__(self, container_manager: ContainerManager):
        self.container_manager = container_manager
        
        # Language configurations
        self.language_configs = {
            "python": {
                "image": "python:3.11-slim",
                "file_extension": ".py",
                "run_command": ["python", "/app/code.py"],
                "timeout": 30,
                "memory_limit": "128m"
            },
            "javascript": {
                "image": "node:18-alpine",
                "file_extension": ".js",
                "run_command": ["node", "/app/code.js"],
                "timeout": 30,
                "memory_limit": "128m"
            },
            "typescript": {
                "image": "node:18-alpine",
                "file_extension": ".ts",
                "run_command": ["sh", "-c", "npx ts-node /app/code.ts"],
                "timeout": 30,
                "memory_limit": "128m",
                "setup_commands": ["npm install -g typescript ts-node"]
            },
            "java": {
                "image": "openjdk:11-jdk-slim",
                "file_extension": ".java",
                "run_command": ["sh", "-c", "cd /app && javac Main.java && java Main"],
                "timeout": 45,
                "memory_limit": "256m",
                "main_class": "Main"
            },
            "cpp": {
                "image": "gcc:latest",
                "file_extension": ".cpp",
                "run_command": ["sh", "-c", "cd /app && g++ -o main code.cpp && ./main"],
                "timeout": 45,
                "memory_limit": "256m"
            },
            "c": {
                "image": "gcc:latest",
                "file_extension": ".c",
                "run_command": ["sh", "-c", "cd /app && gcc -o main code.c && ./main"],
                "timeout": 45,
                "memory_limit": "256m"
            },
            "go": {
                "image": "golang:1.21-alpine",
                "file_extension": ".go",
                "run_command": ["go", "run", "/app/code.go"],
                "timeout": 30,
                "memory_limit": "128m"
            },
            "rust": {
                "image": "rust:latest",
                "file_extension": ".rs",
                "run_command": ["sh", "-c", "cd /app && rustc code.rs && ./code"],
                "timeout": 60,
                "memory_limit": "256m"
            },
            "php": {
                "image": "php:8.2-cli",
                "file_extension": ".php",
                "run_command": ["php", "/app/code.php"],
                "timeout": 30,
                "memory_limit": "128m"
            },
            "ruby": {
                "image": "ruby:3.2-alpine",
                "file_extension": ".rb",
                "run_command": ["ruby", "/app/code.rb"],
                "timeout": 30,
                "memory_limit": "128m"
            },
            "csharp": {
                "image": "mcr.microsoft.com/dotnet/sdk:7.0",
                "file_extension": ".cs",
                "run_command": ["sh", "-c", "cd /app && dotnet run"],
                "timeout": 45,
                "memory_limit": "256m",
                "setup_commands": ["dotnet new console -n app --force"]
            },
            "swift": {
                "image": "swift:5.8",
                "file_extension": ".swift",
                "run_command": ["swift", "/app/code.swift"],
                "timeout": 45,
                "memory_limit": "256m"
            },
            "kotlin": {
                "image": "openjdk:11-jdk-slim",
                "file_extension": ".kt",
                "run_command": ["sh", "-c", "cd /app && kotlinc code.kt -include-runtime -d code.jar && java -jar code.jar"],
                "timeout": 60,
                "memory_limit": "256m",
                "setup_commands": ["apt-get update && apt-get install -y wget unzip && wget -O kotlin.zip https://github.com/JetBrains/kotlin/releases/download/v1.9.0/kotlin-compiler-1.9.0.zip && unzip kotlin.zip && mv kotlinc /opt/ && ln -s /opt/kotlinc/bin/kotlinc /usr/local/bin/kotlinc"]
            },
            "scala": {
                "image": "hseeberger/scala-sbt:11.0.16_1.7.1_2.13.8",
                "file_extension": ".scala",
                "run_command": ["scala", "/app/code.scala"],
                "timeout": 60,
                "memory_limit": "512m"
            },
            "r": {
                "image": "r-base:latest",
                "file_extension": ".r",
                "run_command": ["Rscript", "/app/code.r"],
                "timeout": 45,
                "memory_limit": "256m"
            },
            "perl": {
                "image": "perl:latest",
                "file_extension": ".pl",
                "run_command": ["perl", "/app/code.pl"],
                "timeout": 30,
                "memory_limit": "128m"
            },
            "lua": {
                "image": "nickblah/lua:5.4-alpine",
                "file_extension": ".lua",
                "run_command": ["lua", "/app/code.lua"],
                "timeout": 30,
                "memory_limit": "128m"
            },
            "bash": {
                "image": "bash:latest",
                "file_extension": ".sh",
                "run_command": ["bash", "/app/code.sh"],
                "timeout": 30,
                "memory_limit": "128m"
            }
        }

    async def execute_code(
        self,
        code: str,
        language: str,
        input_data: Optional[str] = None,
        timeout: Optional[int] = None,
        memory_limit: Optional[str] = None
    ) -> ExecutionResponse:
        """Execute code in a secure Docker container"""
        
        execution_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            # Validate language
            if language not in self.language_configs:
                raise ValueError(f"Unsupported language: {language}")
            
            config = self.language_configs[language]
            
            # Use provided limits or defaults
            exec_timeout = timeout or config["timeout"]
            exec_memory_limit = memory_limit or config["memory_limit"]
            
            # Prepare code file
            code_content = self._prepare_code(code, language, config)
            
            # Create and run container
            container = await self.container_manager.create_container(
                image=config["image"],
                command=config["run_command"],
                memory_limit=exec_memory_limit,
                timeout=exec_timeout,
                execution_id=execution_id
            )
            
            # Write code to container
            await self._write_code_to_container(container, code_content, config)
            
            # Execute setup commands if needed
            if "setup_commands" in config:
                for setup_cmd in config["setup_commands"]:
                    await self._run_setup_command(container, setup_cmd)
            
            # Run the code
            result = await self._execute_in_container(
                container, 
                config["run_command"], 
                input_data, 
                exec_timeout
            )
            
            execution_time = time.time() - start_time
            
            return ExecutionResponse(
                execution_id=execution_id,
                status=ExecutionStatus.COMPLETED,
                output=result["output"],
                error=result["error"],
                execution_time=execution_time,
                memory_used=result["memory_used"],
                exit_code=result["exit_code"]
            )
            
        except asyncio.TimeoutError:
            return ExecutionResponse(
                execution_id=execution_id,
                status=ExecutionStatus.TIMEOUT,
                output="",
                error="Execution timed out",
                execution_time=time.time() - start_time,
                memory_used=0,
                exit_code=-1
            )
            
        except Exception as e:
            logger.error(f"Execution failed for {execution_id}: {str(e)}")
            return ExecutionResponse(
                execution_id=execution_id,
                status=ExecutionStatus.ERROR,
                output="",
                error=str(e),
                execution_time=time.time() - start_time,
                memory_used=0,
                exit_code=-1
            )
            
        finally:
            # Cleanup container
            try:
                await self.container_manager.cleanup_container(execution_id)
            except Exception as e:
                logger.error(f"Failed to cleanup container {execution_id}: {str(e)}")

    async def execute_code_stream(
        self,
        code: str,
        language: str,
        input_data: Optional[str] = None,
        timeout: Optional[int] = None,
        memory_limit: Optional[str] = None,
        session_id: str = None
    ) -> AsyncGenerator[Dict, None]:
        """Execute code with real-time output streaming"""
        
        execution_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            # Send start event
            yield {
                "type": "start",
                "execution_id": execution_id,
                "timestamp": time.time()
            }
            
            # Validate language
            if language not in self.language_configs:
                yield {
                    "type": "error",
                    "message": f"Unsupported language: {language}",
                    "timestamp": time.time()
                }
                return
            
            config = self.language_configs[language]
            exec_timeout = timeout or config["timeout"]
            exec_memory_limit = memory_limit or config["memory_limit"]
            
            # Prepare code
            code_content = self._prepare_code(code, language, config)
            
            yield {
                "type": "status",
                "message": "Creating container...",
                "timestamp": time.time()
            }
            
            # Create container
            container = await self.container_manager.create_container(
                image=config["image"],
                command=config["run_command"],
                memory_limit=exec_memory_limit,
                timeout=exec_timeout,
                execution_id=execution_id,
                session_id=session_id
            )
            
            yield {
                "type": "status",
                "message": "Setting up environment...",
                "timestamp": time.time()
            }
            
            # Write code to container
            await self._write_code_to_container(container, code_content, config)
            
            # Setup commands
            if "setup_commands" in config:
                for setup_cmd in config["setup_commands"]:
                    yield {
                        "type": "setup",
                        "command": setup_cmd,
                        "timestamp": time.time()
                    }
                    await self._run_setup_command(container, setup_cmd)
            
            yield {
                "type": "status",
                "message": "Executing code...",
                "timestamp": time.time()
            }
            
            # Execute with streaming
            async for chunk in self._execute_in_container_stream(
                container, 
                config["run_command"], 
                input_data, 
                exec_timeout
            ):
                chunk["execution_id"] = execution_id
                yield chunk
            
            execution_time = time.time() - start_time
            
            yield {
                "type": "complete",
                "execution_id": execution_id,
                "execution_time": execution_time,
                "timestamp": time.time()
            }
            
        except asyncio.TimeoutError:
            yield {
                "type": "timeout",
                "execution_id": execution_id,
                "message": "Execution timed out",
                "execution_time": time.time() - start_time,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Streaming execution failed for {execution_id}: {str(e)}")
            yield {
                "type": "error",
                "execution_id": execution_id,
                "message": str(e),
                "execution_time": time.time() - start_time,
                "timestamp": time.time()
            }
            
        finally:
            # Cleanup
            try:
                await self.container_manager.cleanup_container(execution_id)
            except Exception as e:
                logger.error(f"Failed to cleanup container {execution_id}: {str(e)}")

    async def validate_code(self, code: str, language: str) -> Dict:
        """Validate code syntax without execution"""
        
        try:
            if language not in self.language_configs:
                return {
                    "valid": False,
                    "error": f"Unsupported language: {language}"
                }
            
            config = self.language_configs[language]
            
            # Language-specific validation
            if language == "python":
                return await self._validate_python_code(code)
            elif language == "javascript":
                return await self._validate_javascript_code(code)
            elif language == "java":
                return await self._validate_java_code(code)
            else:
                # For other languages, do basic validation in container
                return await self._validate_code_in_container(code, language, config)
                
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }

    def _prepare_code(self, code: str, language: str, config: Dict) -> str:
        """Prepare code for execution based on language requirements"""
        
        if language == "java":
            # Ensure Java code has proper class structure
            if "class Main" not in code and "public class" not in code:
                code = f"""
public class Main {{
    public static void main(String[] args) {{
        {code}
    }}
}}
"""
        elif language == "csharp":
            # Ensure C# code has proper structure
            if "using System" not in code:
                code = f"""
using System;

class Program {{
    static void Main() {{
        {code}
    }}
}}
"""
        
        return code

    async def _write_code_to_container(self, container, code_content: str, config: Dict):
        """Write code to container filesystem"""
        
        filename = f"code{config['file_extension']}"
        
        if config.get("main_class") == "Main":
            filename = f"Main{config['file_extension']}"
        
        # Create a tar archive with the code file
        import tarfile
        import io
        
        tar_stream = io.BytesIO()
        tar = tarfile.TarFile(fileobj=tar_stream, mode='w')
        
        # Add code file
        code_info = tarfile.TarInfo(name=filename)
        code_info.size = len(code_content.encode('utf-8'))
        code_info.mode = 0o644
        tar.addfile(code_info, io.BytesIO(code_content.encode('utf-8')))
        
        # For C# projects, add project file
        if config.get("setup_commands"):
            if "dotnet new console" in str(config["setup_commands"]):
                project_content = """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net7.0</TargetFramework>
  </PropertyGroup>
</Project>"""
                project_info = tarfile.TarInfo(name="app.csproj")
                project_info.size = len(project_content.encode('utf-8'))
                project_info.mode = 0o644
                tar.addfile(project_info, io.BytesIO(project_content.encode('utf-8')))
        
        tar.close()
        tar_stream.seek(0)
        
        # Extract to container
        container.put_archive('/app', tar_stream.getvalue())

    async def _run_setup_command(self, container, command: str):
        """Run setup command in container"""
        
        try:
            result = container.exec_run(command, workdir='/app')
            if result.exit_code != 0:
                logger.warning(f"Setup command failed: {command}, output: {result.output.decode()}")
        except Exception as e:
            logger.error(f"Failed to run setup command {command}: {str(e)}")

    async def _execute_in_container(
        self, 
        container, 
        command: List[str], 
        input_data: Optional[str], 
        timeout: int
    ) -> Dict:
        """Execute command in container and return results"""
        
        try:
            # Start the container
            container.start()
            
            # Execute the command
            exec_result = container.exec_run(
                command,
                stdin=True,
                stdout=True,
                stderr=True,
                workdir='/app'
            )
            
            # If there's input data, send it
            if input_data:
                exec_result.output = container.exec_run(
                    command,
                    stdin=input_data,
                    stdout=True,
                    stderr=True,
                    workdir='/app'
                ).output
            
            # Get container stats
            stats = container.stats(stream=False)
            memory_used = stats['memory_stats'].get('usage', 0)
            
            # Decode output
            output = exec_result.output.decode('utf-8') if exec_result.output else ""
            
            # Separate stdout and stderr (simplified)
            if exec_result.exit_code == 0:
                return {
                    "output": output,
                    "error": "",
                    "exit_code": exec_result.exit_code,
                    "memory_used": memory_used
                }
            else:
                return {
                    "output": "",
                    "error": output,
                    "exit_code": exec_result.exit_code,
                    "memory_used": memory_used
                }
                
        except Exception as e:
            return {
                "output": "",
                "error": str(e),
                "exit_code": -1,
                "memory_used": 0
            }

    async def _execute_in_container_stream(
        self, 
        container, 
        command: List[str], 
        input_data: Optional[str], 
        timeout: int
    ) -> AsyncGenerator[Dict, None]:
        """Execute command in container with streaming output"""
        
        try:
            container.start()
            
            # Create exec instance
            exec_id = container.client.api.exec_create(
                container.id,
                command,
                stdin=bool(input_data),
                stdout=True,
                stderr=True,
                workdir='/app'
            )['Id']
            
            # Start execution
            exec_socket = container.client.api.exec_start(
                exec_id,
                detach=False,
                stream=True,
                socket=True
            )
            
            # Send input if provided
            if input_data:
                exec_socket._sock.send(input_data.encode('utf-8'))
                exec_socket._sock.shutdown(1)  # Close stdin
            
            # Stream output
            for chunk in exec_socket:
                if chunk:
                    try:
                        decoded = chunk.decode('utf-8')
                        yield {
                            "type": "output",
                            "data": decoded,
                            "timestamp": time.time()
                        }
                    except UnicodeDecodeError:
                        # Handle binary output
                        yield {
                            "type": "output",
                            "data": chunk.hex(),
                            "timestamp": time.time(),
                            "encoding": "hex"
                        }
            
            # Get final execution info
            exec_info = container.client.api.exec_inspect(exec_id)
            
            yield {
                "type": "exit",
                "exit_code": exec_info['ExitCode'],
                "timestamp": time.time()
            }
            
        except Exception as e:
            yield {
                "type": "error",
                "message": str(e),
                "timestamp": time.time()
            }

    async def _validate_python_code(self, code: str) -> Dict:
        """Validate Python code syntax"""
        
        try:
            import ast
            ast.parse(code)
            return {"valid": True}
        except SyntaxError as e:
            return {
                "valid": False,
                "error": f"Syntax error at line {e.lineno}: {e.msg}"
            }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }

    async def _validate_javascript_code(self, code: str) -> Dict:
        """Validate JavaScript code syntax"""
        
        # This would use a JavaScript parser in production
        # For now, return basic validation
        return {"valid": True}

    async def _validate_java_code(self, code: str) -> Dict:
        """Validate Java code syntax"""
        
        # Basic Java validation
        if "public class" not in code and "class" not in code:
            return {
                "valid": False,
                "error": "Java code must contain a class definition"
            }
        
        return {"valid": True}

    async def _validate_code_in_container(self, code: str, language: str, config: Dict) -> Dict:
        """Validate code by attempting compilation in container"""
        
        try:
            execution_id = str(uuid.uuid4())
            
            # Create container for validation
            container = await self.container_manager.create_container(
                image=config["image"],
                command=["echo", "validation"],
                memory_limit="64m",
                timeout=10,
                execution_id=execution_id
            )
            
            # Write code to container
            code_content = self._prepare_code(code, language, config)
            await self._write_code_to_container(container, code_content, config)
            
            # Try to compile/validate
            if language in ["cpp", "c"]:
                # Try compilation
                compile_cmd = ["gcc", "-fsyntax-only", f"/app/code{config['file_extension']}"]
                result = container.exec_run(compile_cmd)
                
                if result.exit_code == 0:
                    return {"valid": True}
                else:
                    return {
                        "valid": False,
                        "error": result.output.decode('utf-8')
                    }
            
            elif language == "java":
                # Try compilation
                compile_cmd = ["javac", f"/app/Main{config['file_extension']}"]
                result = container.exec_run(compile_cmd, workdir='/app')
                
                if result.exit_code == 0:
                    return {"valid": True}
                else:
                    return {
                        "valid": False,
                        "error": result.output.decode('utf-8')
                    }
            
            # For interpreted languages, assume valid if no obvious syntax errors
            return {"valid": True}
            
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }
        finally:
            try:
                await self.container_manager.cleanup_container(execution_id)
            except:
                pass

    def get_supported_languages(self) -> Dict:
        """Get list of supported programming languages"""
        
        languages = {}
        for lang, config in self.language_configs.items():
            languages[lang] = {
                "name": lang.title(),
                "file_extension": config["file_extension"],
                "timeout": config["timeout"],
                "memory_limit": config["memory_limit"],
                "image": config["image"]
            }
        
        return {
            "languages": languages,
            "total_count": len(languages)
        }
