import requests

def get_coordinates(location_name, api_key):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location_name}&key={api_key}"
    r = requests.get(url)
    data = r.json()
    if data['results']:
        return data['results'][0]['geometry']['location']
    return None
