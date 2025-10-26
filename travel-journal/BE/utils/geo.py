# utils/geo.py
"""
Geo utilities for Travel Journal
- Thuần Python, dùng pygeohash (không cần build C).
- Mục tiêu:
  + Tính geohash / geohash_prefix khi ghi dữ liệu
  + Chuyển bbox -> danh sách geohash prefixes để query GSI
  + Kiểm tra 1 điểm có nằm trong bbox hay không
"""

from typing import Dict, Any, Iterable, List, Tuple
import pygeohash as geohash

# Độ chính xác khuyến nghị:
# - Ghi dữ liệu (marker): precision 9 cho geohash đầy đủ
# - Tìm theo vùng: dùng prefix 5 (≈ vài km); có thể tăng/giảm theo zoom
GEOHASH_PRECISION_FULL = 9
GEOHASH_PREFIX_LEN = 5


def geohash_fields(location: Dict[str, Any]) -> Dict[str, str]:
    """
    Tạo geohash và geohash_prefix từ location {lat, lng, [name]}
    """
    lat = float(location["lat"])
    lng = float(location["lng"])
    gh = geohash.encode(lat, lng, precision=GEOHASH_PRECISION_FULL)
    return {
        "geohash": gh,
        "geohash_prefix": gh[:GEOHASH_PREFIX_LEN],
    }


def in_bbox(lat: float, lng: float, bbox: Tuple[float, float, float, float]) -> bool:
    """
    Kiểm tra (lat, lng) có nằm trong bbox không.
    bbox = (minLng, minLat, maxLng, maxLat)
    """
    min_lng, min_lat, max_lng, max_lat = bbox
    return (min_lat <= lat <= max_lat) and (min_lng <= lng <= max_lng)


def parse_bbox(bbox_str: str) -> Tuple[float, float, float, float]:
    """
    Convert chuỗi "minLng,minLat,maxLng,maxLat" -> tuple float.
    Ném ValueError nếu format sai.
    """
    parts = [p.strip() for p in bbox_str.split(",")]
    if len(parts) != 4:
        raise ValueError("bbox must be 'minLng,minLat,maxLng,maxLat'")
    min_lng, min_lat, max_lng, max_lat = map(float, parts)
    if min_lng > max_lng or min_lat > max_lat:
        raise ValueError("bbox invalid: min must be <= max")
    return (min_lng, min_lat, max_lng, max_lat)


def bbox_to_prefixes(
    bbox: Tuple[float, float, float, float],
    precision: int = GEOHASH_PREFIX_LEN,
    step_deg: float = 0.045,
) -> List[str]:
    """
    Rải lưới điểm trong bbox -> encode geohash -> lấy prefix (unique).
    - precision=5 ~ ô vài km. step_deg ~ 0.045 (~5km) là hợp lý.
    - Kết quả dùng để Query GSI `geohash_prefix-index` theo từng prefix.
    """
    min_lng, min_lat, max_lng, max_lat = bbox
    prefixes = set()
    lat = min_lat
    # + step nhỏ để không bỏ sót biên do sai số float
    EPS = 1e-9
    while lat <= max_lat + EPS:
        lng = min_lng
        while lng <= max_lng + EPS:
            prefixes.add(geohash.encode(lat, lng, precision=precision)[:precision])
            lng += step_deg
        lat += step_deg
    return list(prefixes)


def pick_marker_payload(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Chuẩn hoá payload marker trả về cho FE map.
    Lấy 1 ảnh thumbnail đầu tiên nếu có.
    """
    imgs = item.get("imageUrls") or item.get("photos") or []
    return {
        "journalId": item.get("journalId"),
        "title": item.get("title", ""),
        "location": item.get("location", {}),
        "imageUrl": imgs[0] if imgs else None,
    }
