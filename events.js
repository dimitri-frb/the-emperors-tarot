// Event registry. Add new tournaments here: create events/<id>.js exporting
// an EVENT object ({ id, name, storage, defaultMeId, points, players }), then
// import it below. The last entry is the default for first-time visitors.

import { EVENT as MALAGA_OPEN } from "./events/malaga-open.js";
import { EVENT as SHARK_GAMES } from "./events/shark-games.js";

export const EVENTS = [MALAGA_OPEN, SHARK_GAMES];
