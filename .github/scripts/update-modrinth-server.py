"""Link the server listing to the newly published modpack, retaining its address."""

import json
import os
import urllib.error
import urllib.request


SERVER_ID = "BpnBfkpK"
PACK_ID = "kGXXdcTa"
API = "https://api.modrinth.com"


def request(path, token, payload=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": token,
            "Content-Type": "application/json",
            "User-Agent": "CreateVC/CI (github.com/Jammersmurph/CreateVC)",
        },
        method="PATCH" if payload is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=60) as response:
        body = response.read()
        return json.loads(body) if body else None


def update_server(token, version_id):
    if not token or not version_id:
        raise ValueError("MODRINTH_TOKEN and VERSION_ID are required")
    version = request(f"/v2/version/{version_id}", token)
    if version["project_id"] != PACK_ID:
        raise ValueError("Published version does not belong to the modpack project")

    path = f"/v3/project/{SERVER_ID}"
    server = request(path, token)["minecraft_java_server"]
    address = server["address"]
    if not address:
        raise ValueError("Server listing has no address; refusing to change it")
    request(path, token, {
        "minecraft_java_server": {
            "address": address,
            "content": {"kind": "modpack", "version_id": version_id},
        },
    })
    updated = request(path, token)["minecraft_java_server"]
    if (updated["address"] != address
            or updated["content"]["version_id"] != version_id):
        raise ValueError("Server listing did not retain the requested pack and address")
    print(f"Server listing now links to modpack version {version_id}.")


if __name__ == "__main__":
    try:
        update_server(os.environ["MODRINTH_TOKEN"], os.environ["VERSION_ID"])
    except urllib.error.HTTPError as error:
        raise SystemExit(
            f"Modrinth API failed ({error.code}): {error.read().decode()}"
        )
