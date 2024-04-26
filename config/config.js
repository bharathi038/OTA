let config = {
    environment: process.env.SERVERLESS_STAGE || 'dev',
    isLive: process.env.SERVERLESS_STAGE && process.env.SERVERLESS_STAGE == 'prod',
    /**
     * All regex used in applications
     */
    regex: {
        email: new RegExp('^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$', 'i')
    },
    /**
     * Minimum item needed to be in cart to place the order
     */
    minimumItemInCartToProcessOrder:1,
    /**
     * Minimum quantity needed to place the order
     */
    minimumEachItemQuantityToProcessOrder:1,
    /**
     * Maximum quantity allowed to place the order
     */
    maximumEachItemQuantityAllowedToProccessOrder:100,
    /**
     * maximum item allowed in cart to place the order
     */
    maximumItemInCartToProcessOrder:999,
    /**
     * Minimum amount needed to place the order
     */
    minimumAllowedTotalAmountToProcessOrder:0.10,
    /**
     * Maximun amount can be allowed to place order
     */
    maximumAllowedTotalAmountToProccessOrder:1000000,
    /**
     * JWT Token Expiry in Seconds
     */
    jwtTokenExpiresIn:86400,// 1 Day
    /**
     * Database table names
     */
    tables:{
        users:"tbl_users",
        cart:"tbl_cart",
        category:"tbl_category",
        items:"tbl_items",
        order:"tbl_order",
        orderItems:"tbl_order_items",
        orderTax:"tbl_order_tax",
        restaurant:"tbl_restaurant",
        tax:"tbl_tax",
        session:"tbl_session",
    },

    /**
     * HTTP status codes
     */
    HTTP_STATUS_CODE:{
        OK:200,
        CREATED:201,
        NO_CONTENT:204,
        MOVED_PERMANENTLY:301,
        FOUND:302,
        BAD_REQUEST:400,
        UNAUTHORIZED:401,
        FORBIDDEN:403,
        NOT_FOUND:404,
        REQUEST_TIME_OUT:408,
        INTERNAL_SERVER_ERROR:500,
        BAD_GATEWAY:502,
    }
}

module.exports = config;