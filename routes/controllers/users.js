import express from 'express';
var router = express.Router();

router.get('/myIdentity', function (req, res, next) {
    if (req.session.isAuthenticated){ 
        const userInfo = {
            name: req.session.account.name,
            username: req.session.account.username
        };
        res.send ({
            "status": "loggedin",
            "userInfo": userInfo
        });
    } else {
        res.send({ 
            "status": "loggedout"
        })
    }
});

router.get("/", async (req, res) => {
    try {
        let users = await req.models.Users.find(); 
        res.json(users);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

router.post("/addPoints", async (req, res) => {
    const { userId, points } = req.body;
    console.log(userId, points)
    try {
        const user = await req.models.Users.findById(userId);
        console.log(user)
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.points += Number(points);;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).send('Server Error');
    }
})

export default router;