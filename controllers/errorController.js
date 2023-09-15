//handle email or username duplicates
const handleDuplicateKeyError = (err, res) => {
    console.log("handling duplicates")

    let errors = Object.values(err.errors)?.map(error => ({
        param: error?.path,
        message: error?.message,
        code: "RESOURCE_EXISTS"
    }))

    console.log(Object.values(err.errors))
    let code = 400
    const errorResponse = {
        status: false,
        errors
    }
    return res.status(code).send(errorResponse)
}


//handle field formatting, empty fields, and mismatched passwords
const handleValidationError = (err, res) => {

    let errors = Object.values(err.errors).map(error => ({
        param: error.path,
        message: error.message,
        code: "INVALID_INPUT"
    }))

    let code = 400
    const errorResponse = {
        status: false,
        errors
    }
    return res.status(code).send(errorResponse)
}


module.exports = (err, req, res, next) => {
    try {
        if (err.name === 'ValidationError') return err = handleValidationError(err, res);
        console.log("error code ==> ", err.code);
        if (err?.code) return err = handleDuplicateKeyError(err, res);
    } catch (err) {
        console.log(err);
        res.status(500).send('An unknown error occurred.');
    }
}