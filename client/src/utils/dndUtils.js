import { closestCorners, closestCenter, pointerWithin } from "@dnd-kit/core";

export function closestConrnersAndCenterAndPointer(args) {
    const closestCornersCollisions = closestCorners(args);
    const closestCenterCollisions = closestCenter(args);
    const pointerWithinCollisions = pointerWithin(args);

    if (
        closestCornersCollisions.length > 0 &&
        closestCenterCollisions.length > 0 &&
        pointerWithinCollisions.length > 0
    ) {
        return pointerWithinCollisions;
    }

    return null;
}
