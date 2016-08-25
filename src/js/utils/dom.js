/**
 * Insert an element as the first child node of another
 *
 * @param  {Element} child   Element to insert
 * @param  {Element} parent Element to insert child into
 * @private
 * @function insertElFirst
 */
export function insertElFirst (child, parent) {
    if (parent.firstChild) {
        parent.insertBefore(child, parent.firstChild);
    } else {
        parent.appendChild(child);
    }
}