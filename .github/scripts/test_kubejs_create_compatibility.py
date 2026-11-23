"""Guard the Ore Excavation/KubeJS Create construction-order workaround."""

from pathlib import Path
import tomllib
import unittest


ROOT = Path(__file__).resolve().parents[2]


def read_toml(relative):
    return tomllib.loads((ROOT / relative).read_text())


class KubeJSCreateCompatibilityTests(unittest.TestCase):
    def test_ore_excavation_constructs_before_kubejs(self):
        overrides = read_toml("config/fml.toml")["dependencyOverrides"]
        # Adding a dependency preserves version checks; removing one would not.
        self.assertIn("+createoreexcavation", overrides["kubejs"])
        self.assertNotIn("-createoreexcavation", overrides["kubejs"])

if __name__ == "__main__":
    unittest.main()
