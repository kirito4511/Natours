module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); //.catch(next) is really .catch(err => {next(err)})
    }
}