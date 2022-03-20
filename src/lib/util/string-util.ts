const camelCache : {[index: string] : string}= {};

function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

export const camelString = (value: string) => {
    const result = camelCache[value];

    if (!result) {
        camelCache[value] = camelize(value);

        return camelCache[value];
    }

    return result;
};
