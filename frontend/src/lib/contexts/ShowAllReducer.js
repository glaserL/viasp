// https://www.thisdot.co/blog/creating-a-global-state-with-react-hooks
export const reducer = (state, action) => {
    switch (action.type) {
        case "show_all":
            return {
                ...state,
                show_all: !state.show_all
            }

        default:
            return state
    }
}

export function initShowAll(initialShowAll) {
    return {show_all: initialShowAll}
}
