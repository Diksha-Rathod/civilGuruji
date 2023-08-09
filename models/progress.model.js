const { Schema, default: mongoose } = require("mongoose");

var min = [0, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];
var max = [100, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).'];

const progressSchema = new Schema({
    progressPercentage: { type: Number, min: min, max: max }
})

const progress = mongoose.model('Progress', progressSchema)
module.exports = progress