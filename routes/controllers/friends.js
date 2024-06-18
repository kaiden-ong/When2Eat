import express from 'express';
const router = express.Router()

router.post("/add", async (req, res) => {
    const { username, friendname } = req.body;

    if (!username || !friendname) {
        return res.status(400).json({ error: 'User and Friend  are required' });
    }

    try {
        const user = await req.models.Users.findOne({ username: username });
        const friend = await req.models.Users.findOne({ username: friendname });

        if (!user || !friend) {
        return res.status(404).json({ error: 'User not found' });
        }

        if (user.friends.includes(friendname)) {
        return res.status(400).json({ error: 'Already friends' });
        }

        user.friends.push(friendname);
        friend.friends.push(username);

        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/remove", async (req, res) => {
    const { username, friendname } = req.body;

    if (!username || !friendname) {
        return res.status(400).json({ error: 'User and Friend are required' });
    }

    try {
        const user = await req.models.Users.findOne({ username: username });
        const friend = await req.models.Users.findOne({ username: friendname });

        if (!user || !friend) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.friends = user.friends.filter(f => f !== friendname);
        friend.friends = friend.friends.filter(f => f !== username);

        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/list", async (req, res) => {
    const { username } = req.query;

    if (!username) {
    return res.status(400).json({ error: 'Username is required' });
    }

    try {
    const user = await req.models.Users.findOne({ username });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const friends = user.friends;
    res.status(200).json({ friends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

export default router;