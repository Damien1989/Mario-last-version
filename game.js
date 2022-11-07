kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

const MOVE_SPEED = 200
const JUMP_FORCE = 500
let isJumping = true
const FALL_DEATH = 400
const ENEMY_SPEED = 20

loadRoot('https://i.imgur.com/')

loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('tunnel', 'rl3cTER.png')
loadSprite('enemy', 'KPO3fR9.png')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('emptybox', 'bdrLpi6.png')
loadSprite('peach', '1R52BZO.png')
loadSprite('brick', 'fVscIbn.png')
loadSprite('box', 'gqVoI2b.png')
loadSprite('candle', 'I7xSp7w.png')
loadSprite('flower', 'uaUm9sN.png')




scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                                              ',
            '                                                              ',
            '                                                              ',
            '                                                              ',
            '                                                              ',
            '                                                              ',
            '                     ==<<==                                  ',
            '                                                              ',
            '                                           ==     =======  #  ',
            '       $ !     !                    ==========   ==========    ',
            ' ============================================   ============= ',
        ],
        [
            '                                                              ',
            '                                             %             :  ',
            '                             {                          #     ',
            '                       !                                      ',
            ' ? ?   ? ? ? ?  ? ? ? ? ? ? ? ? ?  ?    ?   ? ? ? ? ? ? ? ? ? ',
        ]
    ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '@': [sprite('coin')],
        '#': [sprite('tunnel'), solid(), 'tunnel'],
        '!': [sprite('enemy'), solid(), 'dangerous'],
        '&': [sprite('emptybox'), solid()],
        '<': [sprite('surprise'), solid(), 'coin-surprise'],
        ':': [sprite('peach'), solid()],
        '?': [sprite('brick'), solid()],
        '{': [sprite('box'), solid()],
        '%': [sprite('candle'), solid()],
        '$': [sprite('flower'), solid()],
    }

    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLabel = add([
        text('Super Mario Test'),
        pos(30, 6),
        layer('ui'),
        {
            value: 'You lose',
        }
    ])
    add([text('level ' + 'test', pos(40, 6))])

    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    timer -= dt()
                    if (timer <= 0) {
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(2)
                timer = time
                isBig = true
            }
        }
    }

    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ])


    player.on ("headbump", (obj) => {
        if (obj.is('coin-surprise')){
            gameLevel.spawn('@', obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn('&', obj.gridPos.sub(0,0))
        }
    })

    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    const ENEMY_SPEED = 20
    action('dangerous', (d) => {
        d.move(-ENEMY_SPEED, 0)
    })

    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d)
        } else {
            go('lose', { score : scoreLabel.value})
        }
    })

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score: scoreLabel.value})
        }
    })


    player.collides('tunnel', () => {
        keyPress('down', () => {
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            })
        })
    })

    //here

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    keyPress('space', () => {
        if (player.grounded()) {
            isJumping = true
            player.jump(JUMP_FORCE)
        }
    })


    player.action(() => {
        if (player.grounded()) {
            isJumping = false
        }
    })

})

scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
})
start("game", { level: 0, score: 0})