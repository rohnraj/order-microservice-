import jwt from 'jsonwebtoken';

const verifyUser = (req, res, next) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(access_token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.user = decoded; // Attach user info to request object
        next();
    });
}

const refreshAccessToken = (req, res, next) => {
    const refreshToken = req.cookies?.refresh_token;
    const access_token = req.cookies?.access_token;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (access_token) {
        return next();
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const { id, username, email } = decoded || {};
        const newAccessToken = jwt.sign({ id, username, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        req.user = { id, username, email };
        return next();
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};


export { verifyUser, refreshAccessToken };
