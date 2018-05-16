export const mapToJson = data => {
    return JSON.stringify(
        [...data].map(([key, obj]) => ({
            key,
            ...obj
        }))
    )
}