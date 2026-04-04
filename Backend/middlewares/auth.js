import jwt from 'jsonwebtoken';

export const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'token not found user is not authenticated'
            })
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode.userId;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid token or authentication failed'
        })
    }
}

