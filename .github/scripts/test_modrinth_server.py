import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.error import HTTPError


spec = importlib.util.spec_from_file_location(
    "modrinth_server", Path(__file__).with_name("update-modrinth-server.py")
)
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


def server(version):
    return {"minecraft_java_server": {
        "address": "proxy.createvc.org",
        "content": {"kind": "modpack", "version_id": version},
    }}


class ModrinthServerTests(unittest.TestCase):
    @patch.object(publisher, "request")
    def test_updates_server_not_pack_and_preserves_address(self, request):
        request.side_effect = [
            {"project_id": publisher.PACK_ID}, server("old"), None, server("new"),
        ]
        publisher.update_server("token", "new")
        self.assertEqual(request.call_args_list[2].args, (
            "/v3/project/BpnBfkpK", "token", server("new"),
        ))

    @patch.object(publisher, "request")
    def test_wrong_project_is_rejected_before_patch(self, request):
        request.return_value = {"project_id": publisher.SERVER_ID}
        with self.assertRaises(ValueError):
            publisher.update_server("token", "new")
        self.assertEqual(request.call_count, 1)

    @patch.object(publisher, "request")
    def test_api_failure_is_not_swallowed(self, request):
        request.side_effect = HTTPError("url", 403, "Forbidden", {}, None)
        with self.assertRaises(HTTPError):
            publisher.update_server("token", "new")

    @patch.object(publisher, "request")
    def test_stale_link_fails_verification(self, request):
        request.side_effect = [
            {"project_id": publisher.PACK_ID}, server("old"), None, server("old"),
        ]
        with self.assertRaises(ValueError):
            publisher.update_server("token", "new")


if __name__ == "__main__":
    unittest.main()
