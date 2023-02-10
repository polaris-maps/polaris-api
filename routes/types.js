/**
 * JavaScript definitions of schemas defined in:
 * https://giscience.github.io/openrouteservice/documentation/routing-options/Examples 
 */

/** Permanent features (in OpenStreetMap data), from https://wiki.openstreetmap.org/wiki/Map_features
 * @enum {string}
 */
const PermanentFeature = {
    steps: "steps",
};

/** Types of surfaces, from https://wiki.openstreetmap.org/wiki/Key:surface
 * @enum {string}
 */
const Surface = {
    paved: "paved",
    asphalt: "asphalt",
    chipseal: "chipseal",
    concrete: "concrete",
    concreteLanes: "concrete:lanes",
    concretePlates: "concrete:plates",
    pavingStones: "paving_stones",
    sett: "sett",
    unhewnCobblestone: "unhewn_cobblestone",
    cobblestone: "cobblestone",
    cobblestoneFlattened: "cobblestone:flattened",
    metal: "metal",
    wood: "wood",
    steppingStones: "stepping_stones",
    rubber: "rubber",
    unpaved: "unpaved",
    compacted: "compacted",
    fineGravel: "fine_gravel",
    gravel: "gravel",
    rock: "rock",
    pebblestone: "pebblestone",
    ground: "ground",
    dirt: "dirt",
    earth: "earth",
    grass: "grass",
    grassPaver: "grass_paver",
    mud: "mud",
    sand: "sand",
    woodchips: "woodchips",
    snow: "snow",
    ice: "ice",
    salt: "salt",
    clay: "clay",
    tartan: "tartan",
    artificialTurf: "artificial_turf",
    acrylic: "acrylic",
    metalGrid: "metal_grid",
    carpet: "carpet",
};

/** Types of tracks, from https://wiki.openstreetmap.org/wiki/Key:tracktype
 * @enum {string}
 */
const Track = {
    solid: "grade1",
    mostlySolid: "grade2",
    solidAndSoft: "grade3",
    mostlySoft: "grade4",
    soft: "grade5",
};

/** Types of smoothness, from https://wiki.openstreetmap.org/wiki/Key:smoothness
 * @enum {string}
 */
const Smoothness = {
    excellent: "excellent",
    good: "good",
    intermediate: "intermediate",
    bad: "bad",
    veryBad: "very_bad",
    horrible: "horrible",
    veryHorrible: "very_horrible",
    impassable: "impassable",
};

/** Types of obstacles (not included in OSM data)
 * @enum {string}
 */
const Obstacle = {
    construction: "construction",
    narrow: "narrow",
};

/**
 * @typedef {Object} Restrictions
 * @property {Surface} [surface_type]
 * @property {Track} [track_type]
 * @property {Smoothness} [smoothness_type]
 * @property {number} [maximum_sloped_curb] // should limit range
 * @property {number} [maximum_incline] // should limit range
 * */

/**
 * @typedef {Object} AdaptiveNavRouteRequest
 * @property {[[number, number]]} [coordinates]
 * @property {[PermanentFeature]} [avoid_features]
 * @property {Restrictions} [restrictions]
 * @property {[Obstacle | string]} [avoid_obstacles] // need to define obstacle types
 * */