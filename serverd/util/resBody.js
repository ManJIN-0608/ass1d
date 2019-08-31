module.exports = {

    OK(msg, data) {
        return {
            code: 200,
            success: true,
            msg: msg || 'OK',
            ...data && { data: data },
        };
    },

    FAIL(msg, data) {
        return {
            code: 500,
            success: false,
            msg: msg || 'FAIL',
            ...data && { data: data },
        };
    },

};