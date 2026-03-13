"""
Amazon Nova AI Wrapper Service.

Provides a unified interface to Amazon Nova foundation models via
Amazon Bedrock. Supports text, multimodal (text + image), and
simulation mode for local development.
"""

import json
import os
from typing import Any, Optional

from utils.logger import setup_logger
from utils.helpers import sanitize_json_output

logger = setup_logger(__name__)

# Model identifiers
NOVA_LITE_MODEL = os.getenv("NOVA_LITE_MODEL_ID", "amazon.nova-lite-v1:0")
NOVA_PRO_MODEL = os.getenv("NOVA_PRO_MODEL_ID", "amazon.nova-pro-v1:0")
BEDROCK_REGION = os.getenv("BEDROCK_REGION", "us-east-1")
SIMULATION_MODE = os.getenv("SIMULATION_MODE", "true").lower() == "true"


class NovaWrapper:
    """
    Wrapper around Amazon Bedrock's Nova model API.

    Handles:
    - Text-only inference (Nova Lite)
    - Multimodal inference with images (Nova Lite / Pro)
    - Simulation mode responses for demos
    """

    def __init__(self, simulation_mode: bool = True):
        self.simulation_mode = simulation_mode or SIMULATION_MODE
        self._client = None

        if not self.simulation_mode:
            self._init_client()

    def _init_client(self):
        """Initialize the Bedrock runtime client."""
        try:
            import boto3

            self._client = boto3.client(
                service_name="bedrock-runtime",
                region_name=BEDROCK_REGION,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            logger.info("✅ Amazon Bedrock client initialized (region: %s)", BEDROCK_REGION)
        except ImportError:
            logger.error("boto3 not installed. Install with: pip install boto3")
            raise
        except Exception as exc:
            logger.error("Failed to initialize Bedrock client: %s", exc)
            raise

    def invoke_text(
        self,
        prompt: str,
        model_id: str = NOVA_LITE_MODEL,
        max_tokens: int = 2048,
        temperature: float = 0.2,
        system_prompt: Optional[str] = None,
    ) -> str:
        """
        Invoke Nova model with a text prompt.

        Args:
            prompt: User prompt text
            model_id: Bedrock model identifier
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-1)
            system_prompt: Optional system-level instruction

        Returns:
            Model response as string
        """
        if self.simulation_mode:
            logger.debug("SIMULATION: Skipping Nova API call for text prompt")
            return ""  # Caller handles empty string by using simulation data

        messages = [{"role": "user", "content": [{"text": prompt}]}]

        body: dict[str, Any] = {
            "messages": messages,
            "inferenceConfig": {
                "maxTokens": max_tokens,
                "temperature": temperature,
            },
        }

        if system_prompt:
            body["system"] = [{"text": system_prompt}]

        try:
            response = self._client.invoke_model(
                modelId=model_id,
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json",
            )
            result = json.loads(response["body"].read())
            return result["output"]["message"]["content"][0]["text"]
        except Exception as exc:
            logger.error("Nova text inference failed: %s", exc)
            raise

    def invoke_multimodal(
        self,
        prompt: str,
        image_base64: str,
        image_media_type: str = "image/jpeg",
        model_id: str = NOVA_LITE_MODEL,
        max_tokens: int = 2048,
        temperature: float = 0.2,
    ) -> str:
        """
        Invoke Nova model with text + image (multimodal).

        Args:
            prompt: Text prompt
            image_base64: Base64-encoded image bytes
            image_media_type: MIME type of image
            model_id: Bedrock model identifier
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature

        Returns:
            Model response as string
        """
        if self.simulation_mode:
            logger.debug("SIMULATION: Skipping Nova API call for multimodal prompt")
            return ""

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "image": {
                            "format": image_media_type.split("/")[-1],
                            "source": {"bytes": image_base64},
                        }
                    },
                    {"text": prompt},
                ],
            }
        ]

        body = {
            "messages": messages,
            "inferenceConfig": {
                "maxTokens": max_tokens,
                "temperature": temperature,
            },
        }

        try:
            response = self._client.invoke_model(
                modelId=model_id,
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json",
            )
            result = json.loads(response["body"].read())
            return result["output"]["message"]["content"][0]["text"]
        except Exception as exc:
            logger.error("Nova multimodal inference failed: %s", exc)
            raise

    def invoke_and_parse_json(
        self,
        prompt: str,
        image_base64: Optional[str] = None,
        image_media_type: str = "image/jpeg",
        model_id: str = NOVA_LITE_MODEL,
        max_tokens: int = 2048,
    ) -> dict:
        """
        Invoke Nova model and parse JSON response.

        Args:
            prompt: Text prompt requesting JSON output
            image_base64: Optional base64 image
            image_media_type: MIME type for image
            model_id: Bedrock model ID
            max_tokens: Max tokens

        Returns:
            Parsed dict from model response
        """
        if image_base64:
            raw = self.invoke_multimodal(
                prompt=prompt,
                image_base64=image_base64,
                image_media_type=image_media_type,
                model_id=model_id,
                max_tokens=max_tokens,
            )
        else:
            raw = self.invoke_text(
                prompt=prompt,
                model_id=model_id,
                max_tokens=max_tokens,
            )

        if not raw:
            return {}

        return sanitize_json_output(raw)
