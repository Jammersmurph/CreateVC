import importlib.util
from pathlib import Path
import unittest


spec = importlib.util.spec_from_file_location(
    "optional_metadata", Path(__file__).with_name("validate-optional-metadata.py")
)
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


class OptionalMetadataTests(unittest.TestCase):
    def metadata(self, default):
        return {
            "option": {
                "optional": True,
                "default": default,
                "description": "An optional feature.",
            }
        }

    def test_both_boolean_defaults_are_valid(self):
        for default in (True, False):
            with self.subTest(default=default):
                self.assertEqual([], validator.validate_metadata(self.metadata(default), "mod"))

    def test_strings_numbers_and_missing_defaults_still_fail(self):
        for default in ("true", "false", 1, 0, None, [], {}):
            with self.subTest(default=default):
                errors = validator.validate_metadata(self.metadata(default), "mod")
                self.assertTrue(any("option.default" in error for error in errors))

    def test_optional_must_still_be_true(self):
        for optional in (False, None, "true", 1):
            data = self.metadata(True)
            data["option"]["optional"] = optional
            self.assertTrue(any("option.optional" in error
                                for error in validator.validate_metadata(data, "mod")))

    def test_description_must_still_be_nonempty_text(self):
        for description in ("", "  ", None, False, 42):
            data = self.metadata(False)
            data["option"]["description"] = description
            self.assertTrue(any("option.description" in error
                                for error in validator.validate_metadata(data, "mod")))

    def test_required_mods_without_option_table_are_unchanged(self):
        self.assertEqual([], validator.validate_metadata({"name": "Required mod"}, "mod"))

    def test_invalid_option_table_fails(self):
        self.assertTrue(validator.validate_metadata({"option": "invalid"}, "mod"))


if __name__ == "__main__":
    unittest.main()
