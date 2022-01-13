let vm = new Vue({
    el: "#app", data: {
        // 游戏大小
        size: {
            width: 4, height: 4, minWidth: 3, minHeight: 3
        },
        counts:{
            left:0,
            right: 0,
            down: 0,
            up: 0
        },
        count: 0, // 记录玩了多少局
        state: false, //游戏是否结束标识
        score: 0, // 是否判断游戏结束标识
        overDetermine: false,

        items: []
    }, computed: {
        width() {
            return this.size.width
        }, height() {
            return this.size.height
        }
    }, watch: {
        width(newValue) {
            this.size.width = newValue < this.size.minWidth ? this.size.minWidth : newValue
        }, height(newValue) {
            this.size.height = newValue < this.size.minHeight ? this.size.minHeight : newValue
        }
    }, methods: {
        // 初始化
        init() {
            this.size.width = this.size.width < this.size.minWidth ? this.size.minWidth : this.size.width
            this.size.height = this.size.height < this.size.minHeight ? this.size.minHeight : this.size.height
            for (let i = 0; i < this.size.width; i++) {
                for (let j = 0; j < this.size.height; j++) {
                    this.items.push({
                        value: 0
                    })
                }
            }
            this.count++
        }, // 开始新的游戏
        restart() {
            this.items = []
            this.init()
            this.state = true
            this.score = 0
            this.$refs.game.style.width = 54 * this.size.width + 'px'
            this.counts = {
                left:0,
                right: 0,
                down: 0,
                up: 0
            }
            this.rundomGenerate()
        }, // 判断游戏是否结束，结束返回false,未结束返回true
        gameJudge() {
            // 检测是否所有位置都被填满
            if (!this.getAvailableIndexs().length) {
                for (let i = 0; i < this.size.height; i++) {
                    let temp
                    try {
                        temp = this.items[this.getIndex(0, i)].value
                    } catch (e) {
                        console.log(this.getIndex(0, i), i)
                    }

                    for (let j = 0; j < this.size.width; j++) {
                        const {
                            value
                        } = this.items[this.getIndex(j, i)]
                        // 如果检测到0直接返回true
                        if (!value) {
                            return true
                        }
                        // &&j用于去除j=0时的情况
                        if (temp === value && j) {
                            return true
                        } else {
                            temp = value
                        }
                        // 当检测到2行及以上的时候，检测当前元素纵向上一个
                        if (i > 0) {
                            const {
                                value: topvalue
                            } = this.items[this.getIndex(j, i - 1)]
                            if (value === topvalue) {
                                return true
                            }
                        }
                    }
                }
            } else {
                return true
            }
            return false
        }, setscore(value) {
            this.score += 2 * value
            // console.log(this.score)
        }, setItems(index, value) {
            this.items[index].value = value
        }, // 返回对应坐标处的真实数组下标
        getIndex(x, y) {
            return this.size.width * y + x
        }, // 随机更新一个新元素
        rundomGenerate() {
            let vacancys = this.getAvailableIndexs()
            if (!vacancys.length) {
                return false
            }
            if (vacancys.length === 1 && !this.overDetermine) {
                this.overDetermine = true
                if (!this.gameJudge()) {
                    this.gameOver()
                }
            }
            let randomIndex = Math.floor(Math.random() * (vacancys.length - 1))
            this.items[vacancys[randomIndex]].value = (Math.random() * 10 + 1) > 5 ? 4 : 2
            // this.items[vacancys[randomIndex]].value = 2
            return true
        }, gameOver() {
            this.state = false
        }, // 返回当前所有可用位置下标
        getAvailableIndexs() {
            let arr = []
            this.items.forEach((item, index) => {
                if (!item.value) {
                    arr.push(index)
                }
            })
            return arr
        }, leftOrUp(e, direction) {
            let {
                width, height
            } = this.size
            if (direction === 'left') {
                let temp = width
                width = height
                height = temp
            }
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height - 1; y++) {
                    let index = direction === 'up' ? this.getIndex(x, y) : this.getIndex(y, x)
                    const {
                        value
                    } = this.items[index]
                    if (value) {
                        let k = y + 1
                        while (k < height) {
                            let tindex = direction === 'up' ? this.getIndex(x, k) : this.getIndex(k, x)
                            const {
                                value: tvalue
                            } = this.items[tindex]
                            if (tvalue) {
                                if (tvalue === value) {
                                    this.setItems(index, 2 * value)
                                    this.setItems(tindex, 0)
                                    this.setscore(value)
                                    e.flag = true
                                } else {
                                    let mbindex = direction === 'up' ? this.getIndex(x, y + 1) : this.getIndex(y + 1, x)
                                    this.setItems(mbindex, tvalue)
                                    if (tindex !== mbindex) {
                                        this.setItems(tindex, 0)
                                        e.flag = true
                                    }
                                }
                                break
                            }
                            k++
                        }
                    } else {
                        let k = y + 1
                        while (k < height) {
                            let tindex = direction === 'up' ? this.getIndex(x, k) : this.getIndex(k, x)
                            const {
                                value: tvalue
                            } = this.items[tindex]
                            if (tvalue) {
                                this.setItems(index, tvalue)
                                this.setItems(tindex, 0)
                                e.flag = true
                                y--
                                break
                            }
                            k++
                        }
                    }
                }
            }
        }, rightOrDown(e, direction) {
            let {
                width, height
            } = this.size
            if (direction === 'right') {
                let temp = width
                width = height
                height = temp
            }
            for (let x = 0; x < width; x++) {
                for (let y = height - 1; y > 0; y--) {
                    let index = direction === 'down' ? this.getIndex(x, y) : this.getIndex(y, x)
                    const {
                        value
                    } = this.items[index]
                    if (value) {
                        let k = y - 1
                        while (k >= 0) {
                            let tindex = direction === 'down' ? this.getIndex(x, k) : this.getIndex(k, x)
                            const {
                                value: tvalue
                            } = this.items[tindex]
                            if (tvalue) {
                                if (tvalue === value) {
                                    this.setItems(index, 2 * value)
                                    this.setItems(tindex, 0)
                                    this.setscore(value)
                                    e.flag = true
                                } else {
                                    let mbindex = direction === 'down' ? this.getIndex(x, y - 1) : this
                                        .getIndex(y - 1, x)
                                    this.setItems(mbindex, tvalue)
                                    if (tindex !== mbindex) {
                                        this.setItems(tindex, 0)
                                        e.flag = true
                                    }
                                }
                                break
                            }
                            k--
                        }
                    } else {
                        let k = y - 1
                        while (k >= 0) {
                            let tindex = direction === 'down' ? this.getIndex(x, k) : this.getIndex(k, x)
                            const {
                                value: tvalue
                            } = this.items[tindex]
                            if (tvalue) {
                                this.setItems(index, tvalue)
                                this.setItems(tindex, 0)
                                e.flag = true
                                y++
                                break
                            }
                            k--
                        }
                    }
                }
            }
        }, initClass(value) {
            let comparisonTable = {
                0: 'zero',
                2: 'item_2',
                4: 'item_4',
                8: 'item_8',
                16: 'item_16',
                32: 'item_32',
                64: 'item_64',
                128: 'item_128',
                256: 'item_256',
                512: 'item_512',
                1024: 'item_1024',
                2048: 'item_2048',
                4096: 'item_4096',
                8192: 'item_8192',
                16384: 'item_16384',
                32768: 'item_32768',
                65536: 'item_65536'
            }
            return comparisonTable[value]
        },
        main(key) {
            let state = {
                flag: false
            }
            // console.log(key)

            switch (key) {
                case 37:
                    this.leftOrUp(state, 'left')
                    this.counts.left++
                    break
                case 38:
                    this.leftOrUp(state, 'up')
                    this.counts.up++
                    break
                case 39:
                    this.rightOrDown(state, 'right')
                    this.counts.right++
                    break
                case 40:
                    this.rightOrDown(state, 'down')
                    this.counts.down++
                    break
            }
            return state.flag
        },
        fireKeyEvent(element, evtType, keyCode) {
            var KeyboardEventInit = {key: '', keyCode: keyCode, location: 0, repeat: false, isComposing: false};
            var evtObj = new KeyboardEvent(evtType, KeyboardEventInit);
            element.dispatchEvent(evtObj);
        },
        automaticGame(Model = true) {
            let modelKey = ['up', 'left', 'right', 'down']
            let models = {
                up: 38, left: 37, right: 39, down: 40
            }
            let model = 'up'
            if (Model) {
                let state = setInterval(() => {
                    if (this.state) {
                        this.fireKeyEvent(document, 'keydown', models[model])
                        while (true) {
                            let rundomKey = modelKey[Math.floor(Math.random() * 4)]
                            if (rundomKey !== model) {
                                model = rundomKey
                                break
                            }
                        }
                    } else {
                        clearInterval(state)
                        console.log("游戏结束")
                    }
                }, 10)
            } else {
                while (this.state) {
                    // let result = this.main(models[model])
                    if (this.state && this.main(models[model])) {
                        this.rundomGenerate()
                    }
                    if (this.overDetermine && !this.gameJudge()) {
                        this.gameOver()
                    }
                    while (true) {
                        let rundomKey = modelKey[Math.floor(Math.random() * 4)]
                        if (rundomKey !== model) {
                            model = rundomKey
                            break
                        }
                    }
                }
            }
            console.log(this.counts)
        }
    }, created() {
        this.init()
    }, mounted() {
        // 初始化game容器宽度
        this.$refs.game.style.width = 54 * this.size.width + 'px'
        // 添加键盘事件
        document.addEventListener('keydown', (e) => {
            let key = window.event.keyCode;
            if (key === 13 && !this.state) {
                this.restart()
                return
            }
            if (this.state && this.main(key)) {
                setTimeout(() => {
                    this.rundomGenerate()
                }, 30)
            }
            if (this.overDetermine && !this.gameJudge()) {
                this.gameOver()
            }
        }, false);
    }, filters: {
        test(value) {
            return !value ? '' : value
        }
    }
})