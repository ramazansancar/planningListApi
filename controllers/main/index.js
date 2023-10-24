export const main = async (req, res) => {
    //const { * } = req.params;

    return res
        .status(200)
        .json({
            status: true,
            message: "Planning List API Up :)"
        });
};

export const healthCheck = async (req, res) => {
    return res
        .status(200)
        .json({
            status: true,
            data: "ok",
        })
}