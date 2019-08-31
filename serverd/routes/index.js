var express = require('express');
var router = express.Router();
var reqBody = require('./../util/resBody.js')


var fs = require('fs');


function readFileAsync(filepath) {
    var PATH = './public/';
    return new Promise(function(resolve, reject) {
        fs.readFile(PATH + filepath, 'utf8', function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data.toString()));
        });
    });
}

function writeFileAsync(filepath, str) {
    var PATH = './public/';
    return new Promise(function(resolve, reject) {
        fs.writeFile(PATH + filepath, str, function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

function contains(arrays, id, filed) {
    var i = arrays.length;
    while (i--) {
        if (arrays[i][filed] == id) {
            return i;
        }
    }
    return false;
}


function getChannels(username, group, role, data) {
    var channels = [];
    // Go through all the channels
    for (let i = 0; i < data.channels.length; i++) {
        // Check to see if the channel matches the current group
        if (data.channels[i].group == group.name) {
            if (role > 0) {
                channels.push(data.channels[i]);
            } else {
                // Channel belongs to group, check for access
                let channel = data.channels[i];
                for (let j = 0; j < channel.members.length; j++) {
                    if (username == channel.members[j]) {
                        channels.push(channel);
                    }
                }
            }
        }
    }
    return channels;
}



function getGroups(username, role = 0, data) {
    let groups = [];
    //console.log(role);

    if (role == 0) {
        // Check for group admin
        for (let i = 0; i < data.groups.length; i++) {
            let admins = data.groups[i].admins;
            for (let j = 0; j < admins.length; j++) {
                if (username == admins[j]) {
                    data.groups[i].role = 1;
                    groups.push(data.groups[i]);
                }
            }
        }

        // Check for membership
        for (let i = 0; i < data.groups.length; i++) {
            let members = data.groups[i].members;
            for (let j = 0; j < members.length; j++) {
                if (username == members[j]) {
                    data.groups[i].role = 0;
                    groups.push(data.groups[i]);
                }
            }
        }

        // Grab the channels for each group
        for (let i = 0; i < groups.length; i++) {
            let channels = getChannels(username, groups[i], groups[i].permissions, data);
            groups[i].channels = channels;
        }
    } else {
        for (let i = 0; i < data.groups.length; i++) {
            let group = data.groups[i];
            group.channels = getChannels(username, group, role, data);
            group.role = role;
            groups.push(group);
        }
    }
    return groups;
}



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/getAll', async (req, res, next) => {
    try {
        const data = await readFileAsync('./users.json');
        return res.send(reqBody.OK('', data))
    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL('exception'))
    }
});


router.post('/login', async (req, res, next) => {
    var { username, password } = req.body;

    if (!username || !password) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const data = fullData.users;
        var flag = data.some(item => item.username == username && item.password == password)
        var item = data.filter(item => item.username == username && item.password == password)
        console.log("item -->", item[0].rule);

        let groups = getGroups(username,item[0].rule,fullData);

        return flag ? res.send(reqBody.OK('', { user: item[0], groups: groups })) : res.send(reqBody.FAIL('用户或密码错误'))

    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL('Login fail'))
    }
});

router.post('/addOrUp', async (req, res, next) => {
    var { username, password, email, ...params } = req.body;

    if (!username || !password || !email) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const readData = fullData.users;
        const sortData = readData.sort((a, b) => a.id - b.id)

        if (params.id) {
            var upflag = sortData.some(item => item.id == params.id)
            if (!upflag) {
                return res.send(reqBody.FAIL('User does not exist'))
            } else {
                for (var i = 0; i < readData.length; i++) {
                    var item = readData[i]
                    if (item.id == params.id) {
                        item.username = username
                        item.password = password
                        item.email = email
                        item.rule = params.rule
                    }
                }
                const writeData = await writeFileAsync('./users.json', JSON.stringify(readData));
                return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))
            }

        } else {
            const obj = {
                username,
                password,
                email,
                rule: 0,
                id: sortData[sortData.length - 1].id + 1
            }
            var addflag = sortData.some(item => item.username == obj.username && item.password == obj.password && item.email == obj.email)
            if (addflag) {
                return res.send(reqBody.FAIL('User already exists'))
            } else {
                console.log("obj-->", obj);
                sortData.push(obj)
                fullData.users = sortData
                const writeData = await writeFileAsync('./users.json', JSON.stringify(fullData));
                return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))
            }
        }
    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL('Login fail'))
    }
});


router.get('/del', async (req, res, next) => {

    const { id } = req.query;

    if (!id) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const data = fullData.users;
        const upflag = data.some(item => item.id == id)

        if (upflag) {
            const index = contains(data, id, 'id')
            data.splice(index, 1)
        }
        fullData.users = data
        const writeData = await writeFileAsync('./users.json', JSON.stringify(fullData));
        return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))
    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL('exception'))
    }
});






// Group Chat

router.post('/addGroup', async (req, res, next) => {
    var { newGroupName } = req.body;

    if (!newGroupName) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const readData = fullData.groups;

        let newGroup = {
            'name': req.body.newGroupName,
            'admins': [],
            'members': []
        }
        readData.push(newGroup)
        fullData.groups = readData;
        let json = JSON.stringify(fullData);

        const writeData = await writeFileAsync('./users.json', JSON.stringify(fullData));

        return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))

    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL('Login fail'))
    }
});

router.post('/getGroup', async (req, res, next) => {

    var { username } = req.body;

    if (!username ) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const data = fullData.users;
        var flag = data.some(item => item.username == username)
        var item = data.filter(item => item.username == username)

        let groups = getGroups(username,item[0].rule,fullData);

        return flag ? res.send(reqBody.OK('', { user: item[0], groups: groups })) : res.send(reqBody.FAIL(''))

    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL(''))
    }

})
router.post('/delGroup', async (req, res, next) => {
    var { groupname } = req.body;

    if (!groupname ) {
        return res.send(reqBody.FAIL('Not null'));
    }

    const fullData = await readFileAsync('./users.json');
    const data = fullData.groups;
    const upflag = data.some(item => item.name == groupname)

    if (upflag) {
        const index = contains(data, groupname, 'name')
        console.log("index -->", index);
        data.splice(index, 1)
    }
    fullData.groups = data
    const writeData = await writeFileAsync('./users.json', JSON.stringify(fullData));
    return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))
})



// Channels
router.post('/addChannels', async (req, res, next) => {
    var { newchanname, groupname } = req.body;

    if (!newchanname) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const readData = fullData.channels;

        let newGroup = {
            'name': newchanname,
            'group': groupname,
            'members': []
        }
        readData.push(newGroup)
        fullData.channels = readData;
        let json = JSON.stringify(fullData);

        const writeData = await writeFileAsync('./users.json', JSON.stringify(fullData));

        return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))

    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL(''))
    }
});


router.post('/getChannel', async (req, res, next) => {


    var { groupname } = req.body;

    if (!groupname ) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const data = fullData.channels;
        var flag = data.some(item => item.username == username)
        var item = data.filter(item => item.username == username)

        let groups = getChannels(username,item[0].rule,fullData);

        return flag ? res.send(reqBody.OK('', { user: item[0], groups: groups })) : res.send(reqBody.FAIL(''))

    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL(''))
    }



})

router.post('/delChannel', async (req, res, next) => {




})






// member
router.post('/addmember', async (req, res, next) => {

    var { membername,groupname,channame } = req.body;

    if (!membername || !channame || !groupname) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const readData = fullData.channels;

        var upflag = readData.some(item => item.name == channame && item.group == groupname)
        if (!upflag) {
            return res.send(reqBody.FAIL('Chat does not exist'))
        } else {
            for (var i = 0; i < readData.length; i++) {
                var item = readData[i]
                if (item.name == channame && item.group == groupname) {
                    item.members = [...item.members,membername]
                }
            }
            const writeData = await writeFileAsync('./users.json', JSON.stringify(fullData));
            return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))
        }


    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL(''))
    }
})


router.post('/delmember', async (req, res, next) => {

    var { membername,groupname,channame } = req.body;

    if (!membername || !channame || !groupname) {
        return res.send(reqBody.FAIL('Not null'));
    }

    try {
        const fullData = await readFileAsync('./users.json');
        const readData = fullData.channels;

        var upflag = readData.some(item => item.name == channame && item.group == groupname)
        if (!upflag) {
            return res.send(reqBody.FAIL('Chat does not exist'))
        } else {
            for (var i = 0; i < readData.length; i++) {
                var item = readData[i]
                if (item.name == channame && item.group == groupname) {
                    item.members = item.members.splice(item.members.indexOf(membername), 1)
                }
            }
            const writeData = await writeFileAsync('./users.json', JSON.stringify(fullData));
            return !writeData ? res.send(reqBody.OK('')) : res.send(reqBody.FAIL(''))
        }


    } catch (err) {
        next(err);
        return res.send(reqBody.FAIL(''))
    }
})



















module.exports = router;