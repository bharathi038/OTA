let Application = require("./Application")

class Test extends Application {
    constructor() {
        super();
    }

    test() {
        return this.response({message:"Application Working Fine."});
    }

}

let test = new Test();
module.exports = test;