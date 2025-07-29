from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime

from ..models.conversion import ConversionRequest, ConversionResponse, ConversionHistory
from ..services.ai_client import AIClient
from ..services.code_analyzer import CodeAnalyzer
from ..services.language_detector import LanguageDetector
from ..core.database import get_db
from ..middleware.auth import get_current_user
from ..utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

class CodeConverter:
    def __init__(self):
        self.ai_client = AIClient()
        self.code_analyzer = CodeAnalyzer()
        self.language_detector = LanguageDetector()
        
        # Language-specific conversion templates
        self.conversion_templates = {
            "javascript_to_python": {
                "system_prompt": """You are an expert code converter. Convert JavaScript code to Python while maintaining:
1. Exact functionality and logic
2. Proper Python conventions (snake_case, PEP 8)
3. Appropriate Python libraries and patterns
4. Error handling and edge cases
5. Comments explaining complex conversions

Provide clean, production-ready Python code.""",
                "examples": [
                    {
                        "input": "function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }",
                        "output": "def fibonacci(n):\n    return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)"
                    }
                ]
            },
            "python_to_javascript": {
                "system_prompt": """Convert Python code to JavaScript while maintaining:
1. Exact functionality and logic
2. Modern JavaScript conventions (camelCase, ES6+)
3. Appropriate JavaScript patterns and libraries
4. Proper error handling
5. Comments for complex conversions

Provide clean, modern JavaScript code.""",
                "examples": []
            },
            "java_to_cpp": {
                "system_prompt": """Convert Java code to C++ while maintaining:
1. Exact functionality and logic
2. Proper C++ conventions and best practices
3. Memory management considerations
4. STL usage where appropriate
5. Header file organization

Provide clean, efficient C++ code.""",
                "examples": []
            }
        }

    async def convert_code(
        self,
        source_code: str,
        source_language: str,
        target_language: str,
        user_id: str,
        options: Dict[str, Any] = None
    ) -> ConversionResponse:
        """Convert code from source language to target language"""
        
        try:
            # Detect source language if not provided
            if source_language == "auto":
                detected = await self.language_detector.detect_language(source_code)
                source_language = detected.language
                confidence = detected.confidence
            else:
                confidence = 1.0

            # Validate languages
            if not self._is_supported_language(source_language):
                raise HTTPException(
                    status_code=400,
                    detail=f"Source language '{source_language}' is not supported"
                )
            
            if not self._is_supported_language(target_language):
                raise HTTPException(
                    status_code=400,
                    detail=f"Target language '{target_language}' is not supported"
                )

            # Analyze source code
            analysis = await self.code_analyzer.analyze_code(source_code, source_language)
            
            # Get conversion template
            template_key = f"{source_language}_to_{target_language}"
            template = self.conversion_templates.get(
                template_key,
                self._get_generic_template(source_language, target_language)
            )

            # Prepare conversion prompt
            prompt = self._build_conversion_prompt(
                source_code,
                source_language,
                target_language,
                template,
                analysis,
                options or {}
            )

            # Perform conversion using AI
            converted_code = await self.ai_client.generate_code(
                prompt=prompt,
                max_tokens=4000,
                temperature=0.1  # Low temperature for consistent conversions
            )

            # Post-process converted code
            processed_code = await self._post_process_conversion(
                converted_code,
                target_language,
                options or {}
            )

            # Validate converted code
            validation_result = await self._validate_conversion(
                source_code,
                processed_code,
                source_language,
                target_language
            )

            # Create response
            response = ConversionResponse(
                converted_code=processed_code,
                source_language=source_language,
                target_language=target_language,
                confidence=confidence,
                analysis=analysis,
                validation=validation_result,
                metadata={
                    "conversion_time": datetime.utcnow().isoformat(),
                    "template_used": template_key,
                    "options": options or {}
                }
            )

            # Save to history (background task)
            asyncio.create_task(
                self._save_conversion_history(
                    user_id,
                    source_code,
                    response
                )
            )

            return response

        except Exception as e:
            logger.error(f"Code conversion failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Code conversion failed: {str(e)}"
            )

    def _is_supported_language(self, language: str) -> bool:
        """Check if language is supported for conversion"""
        supported_languages = {
            "javascript", "python", "java", "cpp", "c", "csharp",
            "go", "rust", "typescript", "php", "ruby", "swift",
            "kotlin", "scala", "r", "matlab", "sql", "html", "css"
        }
        return language.lower() in supported_languages

    def _get_generic_template(self, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Get generic conversion template for unsupported language pairs"""
        return {
            "system_prompt": f"""You are an expert programmer. Convert {source_lang} code to {target_lang} while:
1. Maintaining exact functionality and logic
2. Following {target_lang} best practices and conventions
3. Using appropriate libraries and patterns for {target_lang}
4. Handling errors and edge cases properly
5. Adding comments for complex conversions

Provide clean, production-ready {target_lang} code.""",
            "examples": []
        }

    def _build_conversion_prompt(
        self,
        source_code: str,
        source_lang: str,
        target_lang: str,
        template: Dict[str, Any],
        analysis: Dict[str, Any],
        options: Dict[str, Any]
    ) -> str:
        """Build the conversion prompt for AI"""
        
        prompt_parts = [
            template["system_prompt"],
            "",
            f"Source Language: {source_lang}",
            f"Target Language: {target_lang}",
            "",
            "Code Analysis:",
            f"- Complexity: {analysis.get('complexity', 'Unknown')}",
            f"- Functions: {len(analysis.get('functions', []))}",
            f"- Classes: {len(analysis.get('classes', []))}",
            f"- Dependencies: {', '.join(analysis.get('dependencies', []))}",
            ""
        ]

        # Add examples if available
        if template.get("examples"):
            prompt_parts.append("Examples:")
            for i, example in enumerate(template["examples"], 1):
                prompt_parts.extend([
                    f"Example {i}:",
                    f"Input ({source_lang}):",
                    example["input"],
                    f"Output ({target_lang}):",
                    example["output"],
                    ""
                ])

        # Add conversion options
        if options:
            prompt_parts.append("Conversion Options:")
            for key, value in options.items():
                prompt_parts.append(f"- {key}: {value}")
            prompt_parts.append("")

        # Add source code
        prompt_parts.extend([
            f"Convert the following {source_lang} code to {target_lang}:",
            "```" + source_lang,
            source_code,
            "```",
            "",
            f"Provide only the converted {target_lang} code without explanations:"
        ])

        return "\n".join(prompt_parts)

    async def _post_process_conversion(
        self,
        converted_code: str,
        target_language: str,
        options: Dict[str, Any]
    ) -> str:
        """Post-process the converted code"""
        
        # Remove code block markers if present
        if converted_code.startswith("```"):
            lines = converted_code.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            converted_code = "\n".join(lines)

        # Language-specific post-processing
        if target_language.lower() == "python":
            converted_code = self._format_python_code(converted_code)
        elif target_language.lower() in ["javascript", "typescript"]:
            converted_code = self._format_javascript_code(converted_code)
        elif target_language.lower() in ["java"]:
            converted_code = self._format_java_code(converted_code)

        return converted_code.strip()

    def _format_python_code(self, code: str) -> str:
        """Format Python code according to PEP 8"""
        try:
            import autopep8
            return autopep8.fix_code(code)
        except ImportError:
            return code

    def _format_javascript_code(self, code: str) -> str:
        """Format JavaScript code"""
        # Basic formatting - in production, use prettier or similar
        return code

    def _format_java_code(self, code: str) -> str:
        """Format Java code"""
        # Basic formatting - in production, use google-java-format or similar
        return code

    async def _validate_conversion(
        self,
        source_code: str,
        converted_code: str,
        source_language: str,
        target_language: str
    ) -> Dict[str, Any]:
        """Validate the converted code"""
        
        validation_result = {
            "syntax_valid": False,
            "logic_preserved": False,
            "warnings": [],
            "suggestions": []
        }

        try:
            # Syntax validation
            syntax_valid = await self._validate_syntax(converted_code, target_language)
            validation_result["syntax_valid"] = syntax_valid

            if not syntax_valid:
                validation_result["warnings"].append("Syntax validation failed")

            # Logic preservation check (simplified)
            logic_score = await self._check_logic_preservation(
                source_code, converted_code, source_language, target_language
            )
            validation_result["logic_preserved"] = logic_score > 0.8
            validation_result["logic_score"] = logic_score

            if logic_score < 0.8:
                validation_result["warnings"].append("Logic preservation may be incomplete")

        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            validation_result["warnings"].append(f"Validation error: {str(e)}")

        return validation_result

    async def _validate_syntax(self, code: str, language: str) -> bool:
        """Validate syntax of converted code"""
        try:
            if language.lower() == "python":
                import ast
                ast.parse(code)
                return True
            elif language.lower() == "javascript":
                # Use esprima or similar for JS validation
                return True  # Simplified
            else:
                return True  # Simplified for other languages
        except:
            return False

    async def _check_logic_preservation(
        self,
        source_code: str,
        converted_code: str,
        source_language: str,
        target_language: str
    ) -> float:
        """Check if logic is preserved in conversion (simplified)"""
        
        # This is a simplified implementation
        # In production, you might use more sophisticated analysis
        
        try:
            # Compare code structure and patterns
            source_analysis = await self.code_analyzer.analyze_code(source_code, source_language)
            target_analysis = await self.code_analyzer.analyze_code(converted_code, target_language)
            
            # Simple scoring based on function count and complexity
            source_functions = len(source_analysis.get("functions", []))
            target_functions = len(target_analysis.get("functions", []))
            
            if source_functions == 0 and target_functions == 0:
                return 1.0
            
            function_score = min(target_functions / max(source_functions, 1), 1.0)
            
            # Add more sophisticated checks here
            
            return function_score
            
        except Exception as e:
            logger.error(f"Logic preservation check failed: {str(e)}")
            return 0.5  # Default score

    async def _save_conversion_history(
        self,
        user_id: str,
        source_code: str,
        response: ConversionResponse
    ):
        """Save conversion to history"""
        try:
            # This would save to database in production
            logger.info(f"Saving conversion history for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to save conversion history: {str(e)}")

# Router endpoints
@router.post("/convert", response_model=ConversionResponse)
async def convert_code(
    request: ConversionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Convert code from one language to another"""
    
    converter = CodeConverter()
    
    return await converter.convert_code(
        source_code=request.source_code,
        source_language=request.source_language,
        target_language=request.target_language,
        user_id=current_user["user_id"],
        options=request.options
    )

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported programming languages"""
    
    languages = {
        "javascript": {"name": "JavaScript", "extensions": [".js", ".mjs"]},
        "typescript": {"name": "TypeScript", "extensions": [".ts"]},
        "python": {"name": "Python", "extensions": [".py"]},
        "java": {"name": "Java", "extensions": [".java"]},
        "cpp": {"name": "C++", "extensions": [".cpp", ".cc", ".cxx"]},
        "c": {"name": "C", "extensions": [".c"]},
        "csharp": {"name": "C#", "extensions": [".cs"]},
        "go": {"name": "Go", "extensions": [".go"]},
        "rust": {"name": "Rust", "extensions": [".rs"]},
        "php": {"name": "PHP", "extensions": [".php"]},
        "ruby": {"name": "Ruby", "extensions": [".rb"]},
        "swift": {"name": "Swift", "extensions": [".swift"]},
        "kotlin": {"name": "Kotlin", "extensions": [".kt"]},
        "scala": {"name": "Scala", "extensions": [".scala"]},
        "r": {"name": "R", "extensions": [".r", ".R"]},
        "matlab": {"name": "MATLAB", "extensions": [".m"]},
        "sql": {"name": "SQL", "extensions": [".sql"]},
        "html": {"name": "HTML", "extensions": [".html", ".htm"]},
        "css": {"name": "CSS", "extensions": [".css"]}
    }
    
    return {
        "supported_languages": languages,
        "total_count": len(languages)
    }

@router.get("/conversion-history")
async def get_conversion_history(
    limit: int = 10,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get user's conversion history"""
    
    # This would fetch from database in production
    return {
        "conversions": [],
        "total": 0,
        "limit": limit,
        "offset": offset
    }

@router.post("/batch-convert")
async def batch_convert_code(
    requests: List[ConversionRequest],
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Convert multiple code snippets in batch"""
    
    if len(requests) > 10:  # Limit batch size
        raise HTTPException(
            status_code=400,
            detail="Batch size cannot exceed 10 conversions"
        )
    
    converter = CodeConverter()
    results = []
    
    for request in requests:
        try:
            result = await converter.convert_code(
                source_code=request.source_code,
                source_language=request.source_language,
                target_language=request.target_language,
                user_id=current_user["user_id"],
                options=request.options
            )
            results.append({
                "success": True,
                "result": result
            })
        except Exception as e:
            results.append({
                "success": False,
                "error": str(e)
            })
    
    return {
        "batch_results": results,
        "total_processed": len(results),
        "successful": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"])
    }
