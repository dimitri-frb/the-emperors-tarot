// Event registry. Add new tournaments here: create events/<id>.js exporting
// an EVENT object ({ id, name, storage, defaultMeId, points, players }), then
// import it below. The last entry is the default for first-time visitors.

import { EVENT as WCW } from "./events/wcw.js";

export const EVENTS = [WCW];
