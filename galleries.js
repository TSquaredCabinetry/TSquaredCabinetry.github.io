/* Curated from the supplied project photography. Entries intentionally show distinct rooms,
   viewpoints or build stages; redundant angles and off-brand signage are omitted.
   Video files have NO audio track. Put new projects in the relevant category below. */
window.T2_GALLERIES = {
  kitchens: [
    {src:'assets/images/kitchen-loft.webp',title:'Timber beams & fitted cabinetry',alt:'Dark tailored cabinetry, timber beams and a wood island in a finished kitchen',detail:'Kitchen · Finished space'},
    {src:'assets/images/kitchen-gray-wood-island.webp',title:'Walnut-tone island, pale cabinets',alt:'Warm wood kitchen island surrounded by soft gray cabinetry',detail:'Kitchen · Island & cabinetry'},
    {src:'assets/images/kitchen-slate-wide.webp',title:'Slate kitchen & custom island',alt:'Slate cabinetry with white marble-pattern island and natural wood floors',detail:'Kitchen · Full-room view'},
    {src:'assets/images/kitchen-slate-pantry.webp',title:'Full-height pantry & appliance wall',alt:'Tall slate colored pantry cabinets and built-in ovens',detail:'Kitchen · Cabinet detail'},
    {src:'assets/images/kitchen-bicolor-wide.webp',title:'Gray island, white upper cabinets',alt:'Bright kitchen with gray island and white perimeter cabinetry',detail:'Kitchen · Installation photograph'},
    {src:'assets/images/kitchen-bicolor-cabinets.webp',title:'Glass-fronts & built-in storage',alt:'Custom gray kitchen cabinets with display uppers and white countertops',detail:'Kitchen · Cabinet detail'},
    {src:'assets/images/kitchen-blue.webp',title:'Deep blue kitchen',alt:'Rich blue kitchen cabinets with white counters and stainless appliances',detail:'Kitchen · Completed cabinetry'},
    {src:'assets/images/kitchen-wood-island.webp',title:'Dark-stained island',alt:'Dark wood island beneath a rustic pendant in a completed kitchen',detail:'Kitchen · Island'},
    {src:'assets/images/kitchen-wood-hood.webp',title:'Wood range hood detail',alt:'Handsome wood range hood flanked by bright kitchen cabinets',detail:'Kitchen · Millwork detail'},
    {src:'assets/images/kitchen-white.webp',title:'Traditional white cabinetry',alt:'White fitted kitchen with crown moldings and custom storage',detail:'Kitchen · Finished cabinetry'},
    {src:'assets/images/kitchen-walkthrough-poster.webp',video:'assets/videos/kitchen-walkthrough.mp4',title:'Walk through the kitchen',alt:'Silent walkthrough of custom kitchen cabinetry',detail:'Silent film · 21 seconds'}
  ],
  bathrooms: [
    {src:'assets/images/bath-double-vanity.webp',title:'Double vanity, brass details',alt:'White double sink bathroom vanity with brass handles and backlit mirrors',detail:'Bathroom · Finished vanity'},
    {src:'assets/images/bath-wood-double.webp',title:'Natural wood vanity',alt:'Natural wood double vanity with dark stone top and framed mirrors',detail:'Bathroom · Vanity cabinetry'},
    {src:'assets/images/vanity-natural.webp',title:'Vanity cabinet in the making',alt:'Unfinished custom wooden bathroom vanity awaiting final countertop',detail:'Workshop · In progress'}
  ],
  builtins: [
    {src:'assets/images/built-in-oak.webp',title:'Oak built-in shelving',alt:'Natural wood shelving and cabinet doors fitted into an alcove',detail:'Built-ins · Shelving'},
    {src:'assets/images/built-in-wood-mudroom.webp',title:'Mudroom bench & cubbies',alt:'Built-in oak bench with hooks and upper storage in a mudroom',detail:'Built-ins · Entryway'},
    {src:'assets/images/built-in-wood-alcove.webp',title:'Wood-lined entry alcove',alt:'Inset storage nook with natural wood bench and overhead cabinetry',detail:'Built-ins · Entryway'},
    {src:'assets/images/built-in-oak-bookcase.webp',title:'Bookcase made for its wall',alt:'Floor to ceiling natural wood bookcase with drawers and open shelves',detail:'Built-ins · Bookcase'},
    {src:'assets/images/built-in-laundry.webp',title:'Laundry room storage',alt:'Shaker storage cabinets built around the laundry equipment',detail:'Built-ins · Utility room'},
    {src:'assets/images/builtins-walkthrough-poster.webp',video:'assets/videos/builtins-walkthrough.mp4',title:'Walk through the built-ins',alt:'Silent walkthrough of utility-room cabinetry and a natural wood bench',detail:'Silent film · 16 seconds'}
  ],
  signs: [
    {src:'assets/images/cnc-pawpaws-place.webp',title:'Pawpaw’s Place — carved wood sign',alt:'Live-edge wood sign carved with raised green Pawpaw’s Place lettering',detail:'CNC signs · Routed lettering'}
  ]
};
window.T2_GALLERIES.films = [
  window.T2_GALLERIES.kitchens.at(-1),
  window.T2_GALLERIES.builtins.at(-1)
];
window.T2_GALLERIES.featured = [
  window.T2_GALLERIES.kitchens[0],
  window.T2_GALLERIES.kitchens[2],
  window.T2_GALLERIES.bathrooms[0],
  window.T2_GALLERIES.builtins[1],
  window.T2_GALLERIES.signs[0]
];
