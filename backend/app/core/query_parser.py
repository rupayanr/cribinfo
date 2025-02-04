import logging
import json
import re
from pydantic import BaseModel

from app.config import get_settings
from app.core.exceptions import LLMError
from app.providers.llm import get_llm_provider

settings = get_settings()
logger = logging.getLogger(__name__)


# Area to city mapping
AREA_CITY_MAP = {
    # Bangalore areas
    "koramangala": "bangalore",
    "indiranagar": "bangalore",
    "whitefield": "bangalore",
    "electronic city": "bangalore",
    "hsr layout": "bangalore",
    "btm layout": "bangalore",
    "sarjapur": "bangalore",
    "sarjapur road": "bangalore",
    "hebbal": "bangalore",
    "marathahalli": "bangalore",
    "yelahanka": "bangalore",
    "bannerghatta": "bangalore",
    "bannerghatta road": "bangalore",
    "mg road": "bangalore",
    "jp nagar": "bangalore",
    "kundanahalli": "bangalore",
    "banashankari": "bangalore",
    "jayanagar": "bangalore",
    "malleshwaram": "bangalore",
    "rajajinagar": "bangalore",
    # Mumbai areas
    "bandra": "mumbai",
    "bandra west": "mumbai",
    "bandra east": "mumbai",
    "andheri": "mumbai",
    "andheri west": "mumbai",
    "andheri east": "mumbai",
    "worli": "mumbai",
    "thane": "mumbai",
    "thane west": "mumbai",
    "powai": "mumbai",
    "lower parel": "mumbai",
    "goregaon": "mumbai",
    "goregaon east": "mumbai",
    "goregaon west": "mumbai",
    "juhu": "mumbai",
    "vikhroli": "mumbai",
    "mulund": "mumbai",
    "mulund west": "mumbai",
    "navi mumbai": "mumbai",
    "nariman point": "mumbai",
    "kandivali": "mumbai",
    "kandivali east": "mumbai",
    "dadar": "mumbai",
    "chembur": "mumbai",
    "borivali": "mumbai",
    "malad": "mumbai",
    # Delhi/NCR areas
    "greater kailash": "delhi",
    "gk": "delhi",
    "dwarka": "delhi",
    "vasant vihar": "delhi",
    "noida": "delhi",
    "noida sector 62": "delhi",
    "noida sector 18": "delhi",
    "saket": "delhi",
    "hauz khas": "delhi",
    "gurgaon": "delhi",
    "gurugram": "delhi",
    "dlf": "delhi",
    "dlf phase 5": "delhi",
    "defence colony": "delhi",
    "rohini": "delhi",
    "connaught place": "delhi",
    "cp": "delhi",
    "indirapuram": "delhi",
    "south extension": "delhi",
    "lajpat nagar": "delhi",
    "green park": "delhi",
}


class ParsedQuery(BaseModel):
    bhk: int | None = None
    min_price: float | None = None
    max_price: float | None = None
    min_sqft: int | None = None
    max_sqft: int | None = None
    area: str | None = None
    amenities: list[str] = []
    raw_query: str = ""
    inferred_city: str | None = None  # City inferred from area


SYSTEM_PROMPT = """You are a query parser for a real estate search engine.
Extract structured filters from natural language queries about properties.

Return ONLY a valid JSON object with these fields (use null for missing values):
- bhk: number of bedrooms (integer)
- min_price: minimum price in lakhs (number)
- max_price: maximum price in lakhs (number). Note: 1 Cr = 100 lakhs
- min_sqft: minimum square footage (integer)
- max_sqft: maximum square footage (integer)
- area: location/neighborhood name (string)
- amenities: list of amenities mentioned (array of strings)

Examples:
Query: "2BHK under 1Cr with gym"
{"bhk": 2, "max_price": 100, "amenities": ["gym"], "min_price": null, "min_sqft": null, "max_sqft": null, "area": null}

Query: "3BHK in Koramangala"
{"bhk": 3, "area": "Koramangala", "min_price": null, "max_price": null, "min_sqft": null, "max_sqft": null, "amenities": []}

Query: "flat between 50L to 80L with parking"
{"min_price": 50, "max_price": 80, "amenities": ["parking"], "bhk": null, "min_sqft": null, "max_sqft": null, "area": null}

Return ONLY the JSON object, no other text."""


def extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling potential extra text."""
    # Try to find JSON in the response
    json_match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # Try parsing the whole response
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return {}


def infer_city_from_area(area: str | None) -> str | None:
    """Infer city from area name using the mapping."""
    if not area:
        return None

    area_lower = area.lower().strip()

    # Direct match
    if area_lower in AREA_CITY_MAP:
        return AREA_CITY_MAP[area_lower]

    # Partial match (e.g., "Whitefield" matches "whitefield")
    for mapped_area, city in AREA_CITY_MAP.items():
        if mapped_area in area_lower or area_lower in mapped_area:
            return city

    return None


async def parse_query(query: str) -> ParsedQuery:
    """Parse natural language query using LLM provider.

    Args:
        query: Natural language search query

    Returns:
        ParsedQuery with extracted filters

    Raises:
        LLMError: If LLM parsing fails
    """
    if not query or not query.strip():
        logger.warning("Empty query provided")
        return ParsedQuery(raw_query="")

    try:
        llm = get_llm_provider()
        response = await llm.chat(SYSTEM_PROMPT, f"Query: {query}")

        result = extract_json(response)
        result["raw_query"] = query

        # Infer city from area
        area = result.get("area")
        result["inferred_city"] = infer_city_from_area(area)

        return ParsedQuery(**result)

    except LLMError:
        raise
    except Exception as e:
        logger.exception(f"Unexpected query parsing error: {e}")
        # Return a basic parsed query on error instead of failing completely
        logger.info("Falling back to empty parsed query")
        return ParsedQuery(raw_query=query)
