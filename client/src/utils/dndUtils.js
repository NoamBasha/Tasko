import { closestCorners, closestCenter } from "@dnd-kit/core";

export function closestConrnersAndCenter(args) {
    const closestCornersCollisions = closestCorners(args);
    const closestCenterCollisions = closestCenter(args);

    if (
        closestCornersCollisions.length > 0 &&
        closestCenterCollisions.length > 0
    ) {
        return closestCornersCollisions;
    }

    return null;
}
