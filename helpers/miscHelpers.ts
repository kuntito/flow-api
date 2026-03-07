import ms from "ms";

/**
 * an abstraction over the `ms` npm package,.
 * converts a duration string to seconds.
 *
 * @param value - A duration string (e.g. "1s", "5m", "2h")
 * @returns the duration in seconds
 */
export function secs(value: ms.StringValue): number {
    return ms(value) / 1000;
}



/**
 * shuffles an array in-place.
 */
export const shuffleArray = (array: any[]) => {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [
            array[currentIndex],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
};
