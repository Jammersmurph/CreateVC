// KubeJS server script for CreateVC.
// Place in: kubejs/server_scripts/cosmonautics_no_ore_recipes.server.js
// Purpose: let players progress through Cosmonautics titanium without relying on
// naturally generated Rocketnautics titanium ore.

ServerEvents.recipes(event => {
  const id = name => `createvc:cosmonautics_no_ore/${name}`

  // Main bypass: craft raw titanium from common Create-era materials.
  // This avoids needing rocketnautics:titanium_ore or deepslate_titanium_ore.
  event.shaped(Item.of('rocketnautics:raw_titanium', 4), [
    'ICI',
    'CAC',
    'ICI'
  ], {
    I: '#c:ingots/iron',
    C: '#c:ingots/copper',
    A: 'create:andesite_alloy'
  }).id(id('raw_titanium_from_iron_copper_and_andesite_alloy'))

  // Optional convenience: allow the raw material to be made into ore blocks for
  // recipes/automation paths that specifically expect ore blocks.
  event.shaped('rocketnautics:titanium_ore', [
    'SSS',
    'SRS',
    'SSS'
  ], {
    S: 'minecraft:stone',
    R: 'rocketnautics:raw_titanium'
  }).id(id('titanium_ore_from_raw_titanium'))

  event.shaped('rocketnautics:deepslate_titanium_ore', [
    'DDD',
    'DRD',
    'DDD'
  ], {
    D: 'minecraft:deepslate',
    R: 'rocketnautics:raw_titanium'
  }).id(id('deepslate_titanium_ore_from_raw_titanium'))

  // Create processing alternative: turn the craftable raw titanium into crushed
  // titanium without needing to mine the ore first.
  event.recipes.create.crushing([
    'rocketnautics:crushed_raw_titanium',
    CreateItem.of('create:experience_nugget', 0.75)
  ], 'rocketnautics:raw_titanium').processingTime(400).id(id('crushing_raw_titanium'))

  // Cosmonautics' default washing recipe gives netherite scrap at 5%.
  // Keep it possible, but make it rare enough to avoid easy netherite automation.
  event.remove({ id: 'rocketnautics:splashing/crushed_raw_titanium' })
  event.recipes.create.splashing([
    Item.of('rocketnautics:titanium_nugget', 9),
    CreateItem.of('minecraft:netherite_scrap', 0.001)
  ], 'rocketnautics:crushed_raw_titanium').id(id('splashing_crushed_raw_titanium'))

  // Replace the default titanium alloy recipe's netherite scrap requirement.
  event.remove({ id: 'rocketnautics:mixing/titanium_alloy' })
  event.recipes.create.mixing('4x rocketnautics:titanium_alloy', [
    '3x rocketnautics:titanium_ingot',
    '5x createdeco:industrial_iron_ingot'
  ]).superheated().id(id('mixing_titanium_alloy'))

  // Cosmonautics currently has no recipe for the Space Helmet.
  event.shaped('rocketnautics:space_helmet', [
    'TGT',
    'GHG',
    'TPT'
  ], {
    T: 'rocketnautics:titanium_alloy_sheet',
    G: '#c:glass_panes',
    H: 'create:copper_diving_helmet',
    P: 'create:precision_mechanism'
  }).id(id('space_helmet'))

  // Direct smelting/blasting fallback. Cosmonautics already provides tag-based
  // smelting for raw titanium, but these explicit recipes keep the bypass stable
  // if tags change later.
  event.smelting('rocketnautics:titanium_ingot', 'rocketnautics:raw_titanium')
    .xp(0.7)
    .cookingTime(200)
    .id(id('smelting_raw_titanium'))

  event.blasting('rocketnautics:titanium_ingot', 'rocketnautics:raw_titanium')
    .xp(0.7)
    .cookingTime(100)
    .id(id('blasting_raw_titanium'))
})
