function decimal(number, percision){
    percision = Math.pow(10, percision);
    return Math.round(number * percision) / percision;
}

module.exports.decimal = decimal;