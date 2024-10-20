function makemaze(width, height) {
    const maze = Array(height).fill().map(() => Array(width).fill("#"))

    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]]

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]
        }

        return array
    }

    function carve(x, y) {
        maze[y][x] = " "

        const sd = shuffle(directions)

        for (const [dx, dy] of sd) {
            const nx = x + dx
            const ny = y + dy

            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === "#") {
                maze[ny - dy / 2][nx - dx / 2] = " "
                carve(nx, ny)
            }
        }
    }

    function findend() {
        var deadends = []

        for (var y = 1; y < height - 1; y++) {
            for (var x = 1; x < width - 1; x++) {
                if (maze[y][x] == " ") {
                    var walls = 0

                    if (maze[y - 1][x] == "#") walls++
                    if (maze[y + 1][x] == "#") walls++
                    if (maze[y][x - 1] == "#") walls++
                    if (maze[y][x + 1] == "#") walls++

                    if (walls == 3) {deadends.push([y, x])}
                }
            }
        }

        return deadends
    }

    function hallcenter(pickchance = 20) {
        const centers = []

        for (let y = 1; y < height - 1; y++) {
            var hallstart = -1
            
            for (let x = 1; x < width - 1; x++) {
                if (Math.floor(Math.random() * pickchance) + 1 == 1) {
                    if (maze[y][x] == " ") {if (hallstart == -1) hallstart = x}
                    else {
                        if (hallstart != -1 && x - hallstart > 2) {
                            const centerx = Math.floor((x + hallstart - 1) / 2)
                            centers.push([y, centerx])
                        }
                        
                        hallstart = -1
                    }
                }
            }
        }

        for (let x = 1; x < width - 1; x++) {
            var hallstart = -1
            
            for (let y = 1; y < height - 1; y++) {
                if (Math.floor(Math.random() * pickchance) + 1 == 1) {
                    if (maze[y][x] == " ") {if (hallstart == -1) hallstart = y}
                    else {
                        if (hallstart != -1 && y - hallstart > 2) {
                            const centery = Math.floor((y + hallstart - 1) / 2)
                            centers.push([centery, x])
                        }
                        
                        hallstart = -1
                    }
                }
            }
        }

        return centers
    }

    carve(1, 1)

    var hordespawns = []
    const endspots = findend()

    var endspot = [0, 0]

    for (let i of endspots) {
        if (i[0] + i[1] > endspot[0] + endspot[1]) {endspot = i}
        if (Math.floor(Math.random() * 5) + 1 == 1 && i[0] != 1 && i[1] != 1) {hordespawns.push(i)}
    }

    var nextempty = "none"

    if (maze[2][1] == " ") {nextempty = "down"}
    if (maze[1][2] == " ") {nextempty = "right"}

    var nextemptyend = ["up", "down", "left", "right"]
    var walls = 0

    if (maze[endspot[0] - 1][endspot[1]] == "#") {
        walls++
        nextemptyend.splice(nextemptyend.indexOf("left"), 1)
    }
    
    if (maze[endspot[0] + 1][endspot[1]] == "#") {
        walls++
        nextemptyend.splice(nextemptyend.indexOf("right"), 1)
    }
    
    if (maze[endspot[0]][endspot[1] - 1] == "#") {
        walls++
        nextemptyend.splice(nextemptyend.indexOf("up"), 1)
    }
    
    if (maze[endspot[0]][endspot[1] + 1] == "#") {
        walls++
        nextemptyend.splice(nextemptyend.indexOf("down"), 1)
    }

    if (walls == 3) {
        nextemptyend = nextemptyend[0]
        
        if (nextemptyend == "up") {nextemptyend = [endspot[0], endspot[1] - 1]}
        if (nextemptyend == "down") {nextemptyend = [endspot[0], endspot[1] + 1]}
        if (nextemptyend == "left") {nextemptyend = [endspot[0] - 1, endspot[1]]}
        if (nextemptyend == "right") {nextemptyend = [endspot[0] + 1, endspot[1]]}
    }

    const bossspawns = hallcenter(40)
    const shooterspawns = hallcenter()
    const infectorspawns = hallcenter()
    const normalenemyspawns = hallcenter()

    var teleporterpos = []
    var ct = []

    while (teleporterpos.length < 3) {
        maze.forEach((v, i) => {
            v.forEach((j, k) => {
                if (j == " " && i != 1 && k != 1 && i != endspot[0] && k != endspot[1] && !hordespawns.some(h => h[0] == i && h[1] == k)) {
                    if (Math.random() > 0.975) {
                        if (ct.length < 2) {ct.push(new THREE.Vector3(k, 0, i))}
                        else {
                            teleporterpos.push(ct)
                            ct = []
                        }
                    }
                }
            })
        })
    }

    teleporterpos = shufflearrays(teleporterpos)

    return {
        maze,
        endspot,
        nextempty,
        bossspawns,
        hordespawns,
        nextemptyend,
        shooterspawns,
        teleporterpos,
        infectorspawns,
        normalenemyspawns
    }
}