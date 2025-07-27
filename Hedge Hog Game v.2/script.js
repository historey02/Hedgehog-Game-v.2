const hogSidebar = document.getElementById('hogSidebar');
const hogField = document.getElementById('hogField');

class Game {
    constructor(startingCash) {
        this.hogDollars = startingCash;
        this.hedgehogs = [];
        this.renderHogCard(NormalHedgehog, "normal-hedgehog-card");
        this.gameLoop();
    }
    renderHogCard(type, id) {
        document.getElementById(id).style.display = "block";
        this.updateHogCard(type, id);
    }
    updateHogCard(hedgehogType, id) {
        const type = id.replace('card', '');
        const incomePerHog = new hedgehogType().income;
        const count = this.hedgehogs.filter(h => h instanceof hedgehogType).length;
        const priceSpan = document.getElementById(`${type}price-span`);
        const ownedSpan = document.getElementById(`${type}owned-span`);
        const rateSpan = document.getElementById(`${type}rate-span`);
        priceSpan.textContent = this.getNextPrice(hedgehogType);
        ownedSpan.textContent = count;
        rateSpan.textContent = incomePerHog * count;
    }
    earnHogDollars() {
        this.hedgehogs.forEach((hog) => {
            this.hogDollars += hog.income;
        });
    }
    updateHogDollars() {
        const hogDollarsSpan = document.getElementById('hog-dollars-span');
        hogDollarsSpan.textContent = this.hogDollars;
    }
    buyHedgehog(hedgehogType, id) {
        const price = this.getNextPrice(hedgehogType);
        if (this.hogDollars >= price) {
            this.hogDollars -= price;
            this.updateHogDollars();
            const newHog = new hedgehogType();
            this.addHog(newHog);
            this.updateHogCard(hedgehogType, id);
        }
    }
    //TODO: addHog()
    addHog(newHog) {
        this.hedgehogs.push(newHog);
        const img = document.createElement('img');
        img.src = newHog.image;
        img.classList.add('hedgehog');

        // Add class based on hedgehog type
        if (newHog instanceof NormalHedgehog) img.classList.add('normal');
        else if (newHog instanceof BlueHedgehog) img.classList.add('blue');
        else if (newHog instanceof CoolHedgehog) img.classList.add('cool');
        else if (newHog instanceof WizardHedgehog) img.classList.add('wizard');
        else if (newHog instanceof RainbowHedgehog) img.classList.add('rainbow');
        else if (newHog instanceof KarateHedgehog) img.classList.add('karate');

        newHog.attachToElement(img);
        hogField.appendChild(img);
        newHog.checkPoints();
    }
    //TODO: getNextPrice()
    getNextPrice(hedgehogType) {
        const basePrice = hedgehogType.basePrice;
        const owned = this.hedgehogs.filter(hog => hog instanceof hedgehogType).length;
        return Math.floor(basePrice * (1.01 ** owned));
        //returns the base price time 1% compounded per hedgehog of that type
    }

    saveGame() {
        const data = {
            hogDollars: this.hogDollars,
            hedgehogs: {
                normal: this.hedgehogs.filter(h => h instanceof NormalHedgehog).length,
                blue: this.hedgehogs.filter(h => h instanceof BlueHedgehog).length,
                cool: this.hedgehogs.filter(h => h instanceof CoolHedgehog).length,
                wizard: this.hedgehogs.filter(h => h instanceof WizardHedgehog).length,
                rainbow: this.hedgehogs.filter(h => h instanceof RainbowHedgehog).length,
                karate: this.hedgehogs.filter(h => h instanceof KarateHedgehog).length
            }
        };

        localStorage.setItem('hedgehogSave', JSON.stringify(data));
    }
    loadGame() {
        const saved = localStorage.getItem('hedgehogSave');
        if (!saved) return;

        const data = JSON.parse(saved);
        this.hogDollars = data.hogDollars;
        this.updateHogDollars();

        // Restore hedgehogs
        const typeMap = {
            normal: NormalHedgehog,
            blue: BlueHedgehog,
            cool: CoolHedgehog,
            wizard: WizardHedgehog,
            rainbow: RainbowHedgehog,
            karate: KarateHedgehog
        };

        for (const [key, count] of Object.entries(data.hedgehogs)) {
            const type = typeMap[key];
            const cardId = `${key}-hedgehog-card`;

            if (count > 0) {
                this.renderHogCard(type, cardId);
                for (let i = 0; i < count; i++) {
                    const hog = new type();
                    this.addHog(hog);
                }
                this.updateHogCard(type, cardId); // 💡 this line ensures correct count + rate shown
            }
        }
    }


    gameLoop() {
        setInterval(() => {
            this.earnHogDollars();
            this.updateHogDollars();
        }, 1000);
    }
}

class Hedgehog {
    constructor(income, price, image) {
        this.income = income;
        this.price = price;
        this.image = image;
    }
}

class NormalHedgehog extends Hedgehog {
    static basePrice = 10;
    static type = "Normal Hedgehog";
    constructor() {
        super(1, NormalHedgehog.basePrice, './NormalHedgehog.png');
    }
    attachToElement(element) {
        this.element = element;
        this.startMoving();
    }
    startMoving() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;
        const randomX = Math.floor(Math.random() * (fieldWidth - 64));
        const randomY = Math.floor(Math.random() * (fieldHeight - 64));
        this.element.style.left = randomX + 'px';
        this.element.style.top = randomY + 'px';
        this.move();
    }
    move() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;

        const x = parseInt(this.element.style.left) || 0;
        const y = parseInt(this.element.style.top) || 0;

        //How far a hedgehog can move at a time
        const movementDistance = 100;

        let newX = x + (Math.random() > 0.5 ? Math.random() * movementDistance : Math.random() * -movementDistance);
        if (newX > fieldWidth - 64) {
            newX = fieldWidth - 64;
        }
        else if (newX < 0) {
            newX = 0;
        }
        let newY = y + (Math.random() > 0.5 ? Math.random() * movementDistance : Math.random() * -movementDistance);
        if (newY > fieldHeight - 64) {
            newY = fieldHeight - 64;
        }
        else if (newY < 0) {
            newY = 0;
        }

        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';

        //Sets frequency of movement. Currently somewhere between 1.5 and 10.0, difference 8.5 seconds
        const randomTime = (Math.random() * 8500) + 1500;
        setTimeout(() => {
            this.move();
        }, randomTime);
    }
    checkPoints() {
        if (game.hedgehogs.filter(hog => hog instanceof NormalHedgehog).length >= 20) {
            game.renderHogCard(BlueHedgehog, 'blue-hedgehog-card');
        }
    }
}
const normalHedgehogCard = document.getElementById('normal-hedgehog-card');
normalHedgehogCard.addEventListener('click', (e) => {
    game.buyHedgehog(NormalHedgehog, e.currentTarget.id);
});


class BlueHedgehog extends Hedgehog {
    static basePrice = 50;
    static type = "Blue Hedgehog";
    constructor() {
        super(10, BlueHedgehog.basePrice, './BlueHedgehog.png');
    }
    attachToElement(element) {
        this.element = element;
        this.startMoving();
    }
    startMoving() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;
        const randomX = Math.floor(Math.random() * (fieldWidth - 64));
        const randomY = Math.floor(Math.random() * (fieldHeight - 64));
        this.element.style.left = randomX + 'px';
        this.element.style.top = randomY + 'px';
        this.move();
    }
    //TODO Make movement unique from normal hedgehog. Probably really fast. Maybe dust particles. or flames
    move() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;

        const x = parseInt(this.element.style.left) || 0;
        const y = parseInt(this.element.style.top) || 0;

        //Defines total possible movement distance and the minimum movement
        const movementDistance = 200;
        const minMovement = 100;

        let newX = x + (Math.random() > 0.5 ? minMovement + Math.random() * movementDistance : -(minMovement + Math.random() * movementDistance));
        if (newX > fieldWidth - 64) {
            newX = fieldWidth - 64;
        }
        else if (newX < 0) {
            newX = 0;
        }
        let newY = y + (Math.random() > 0.5 ? minMovement + Math.random() * movementDistance : -(minMovement + Math.random() * movementDistance));
        if (newY > fieldHeight - 64) {
            newY = fieldHeight - 64;
        }
        else if (newY < 0) {
            newY = 0;
        }

        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';

        const randomTime = (Math.random() * 8500) + 1500;
        setTimeout(() => {
            this.move();
        }, randomTime);
    }

    checkPoints() {
        if (game.hedgehogs.filter(hog => hog instanceof BlueHedgehog).length >= 20) {
            game.renderHogCard(CoolHedgehog, 'cool-hedgehog-card');
        }
    }
}
const blueHedgehogCard = document.getElementById('blue-hedgehog-card');
blueHedgehogCard.addEventListener('click', (e) => {
    game.buyHedgehog(BlueHedgehog, e.currentTarget.id);
});

class CoolHedgehog extends Hedgehog {
    static basePrice = 100;
    static type = "Cool Hedgehog";
    constructor() {
        super(20, CoolHedgehog.basePrice, './CoolHedgehog.png');
    }
    attachToElement(element) {
        this.element = element;
        this.startMoving();
    }
    startMoving() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;
        const randomX = Math.floor(Math.random() * (fieldWidth - 64));
        const randomY = Math.floor(Math.random() * (fieldHeight - 64));
        this.element.style.left = randomX + 'px';
        this.element.style.top = randomY + 'px';
        this.move();
    }
    //TODO: make movement unique. Bounce, swagger. DRIVE IN A FANCY CAR
    move() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;

        const x = parseInt(this.element.style.left) || 0;
        const y = parseInt(this.element.style.top) || 0;

        let newX = x + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
        if (newX > fieldWidth - 64) {
            newX = fieldWidth - 64;
        }
        else if (newX < 0) {
            newX = 0;
        }
        let newY = y + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
        if (newY > fieldHeight - 64) {
            newY = fieldHeight - 64;
        }
        else if (newY < 0) {
            newY = 0;
        }

        //switch image to sports-cars
        this.element.src = './sports-car.png';

        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';

        //This needs to match the transition speed

        setTimeout(() => {
            this.element.src = './CoolHedgehog.png';
        }, 1000);


        const randomTime = (Math.random() * 8500) + 1500;
        setTimeout(() => {
            this.move();
        }, randomTime);
    }
    checkPoints() {
        if (game.hedgehogs.filter(hog => hog instanceof CoolHedgehog).length >= 20) {
            game.renderHogCard(WizardHedgehog, 'wizard-hedgehog-card');
        }
    }
}
const coolHedgehogCard = document.getElementById('cool-hedgehog-card');
coolHedgehogCard.addEventListener('click', (e) => {
    game.buyHedgehog(CoolHedgehog, e.currentTarget.id);
});

class WizardHedgehog extends Hedgehog {
    static basePrice = 1000;
    static type = "Wizard Hedgehog";
    constructor() {
        super(100, WizardHedgehog.basePrice, './WizardHedgehog.png');
    }
    attachToElement(element) {
        this.element = element;
        this.startMoving();
    }
    startMoving() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;
        const randomX = Math.floor(Math.random() * (fieldWidth - 64));
        const randomY = Math.floor(Math.random() * (fieldHeight - 64));
        this.element.style.left = randomX + 'px';
        this.element.style.top = randomY + 'px';
        this.move();
    }
    //TODO: Create unique movement. Teleport
    move() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;

        const x = parseInt(this.element.style.left) || 0;
        const y = parseInt(this.element.style.top) || 0;

        let newX = x + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
        if (newX > fieldWidth - 64) {
            newX = fieldWidth - 64;
        }
        else if (newX < 0) {
            newX = 0;
        }
        let newY = y + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
        if (newY > fieldHeight - 64) {
            newY = fieldHeight - 64;
        }
        else if (newY < 0) {
            newY = 0;
        }

        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';


        const randomTime = (Math.random() * 8500) + 1500;
        setTimeout(() => {
            this.move();
        }, randomTime);
    }
    checkPoints() {
        if (game.hedgehogs.filter(hog => hog instanceof WizardHedgehog).length >= 20) {
            game.renderHogCard(RainbowHedgehog, 'rainbow-hedgehog-card');
        }
    }
}
const wizardHedgehogCard = document.getElementById('wizard-hedgehog-card');
wizardHedgehogCard.addEventListener('click', (e) => {
    game.buyHedgehog(WizardHedgehog, e.currentTarget.id);
});

class RainbowHedgehog extends Hedgehog {
    static basePrice = 10000;
    static type = "Rainbow Hedgehog";
    constructor() {
        super(1000, RainbowHedgehog.basePrice, './RainbowHedgehog.png');
    }
    attachToElement(element) {
        this.element = element;
        this.startMoving();
    }
    startMoving() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;
        const randomX = Math.floor(Math.random() * (fieldWidth - 64));
        const randomY = Math.floor(Math.random() * (fieldHeight - 64));
        this.element.style.left = randomX + 'px';
        this.element.style.top = randomY + 'px';
        this.move();
    }
    //TODO: Create unique movement. Has rainbow trails
    move() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;
        /*
                const x = parseInt(this.element.style.left) || 0;
                const y = parseInt(this.element.style.top) || 0;
        
                let newX = x + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
                if (newX > fieldWidth - 64) {
                    newX = fieldWidth - 64;
                }
                else if (newX < 0) {
                    newX = 0;
                }
                let newY = y + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
                if (newY > fieldHeight - 64) {
                    newY = fieldHeight - 64;
                }
                else if (newY < 0) {
                    newY = 0;
                }
        
                this.element.style.left = newX + 'px';
                this.element.style.top = newY + 'px';
        
                const randomTime = (Math.random() * 8500) + 1500;
                setTimeout(() => {
                    this.move();
                }, randomTime);
                */
        const steps = 30;
        let step = 0;

        const startX = parseInt(this.element.style.left) || 0;
        const startY = parseInt(this.element.style.top) || 0;
        const targetX = Math.floor(Math.random() * (hogField.clientWidth - 64));
        const targetY = Math.floor(Math.random() * (hogField.clientHeight - 64));

        const deltaX = (targetX - startX) / steps;
        const deltaY = (targetY - startY) / steps;

        const interval = setInterval(() => {
            const offsetX = deltaX * step;
            const offsetY = deltaY * step + Math.sin(step / 2) * 10; // wiggly
            this.element.style.left = `${startX + offsetX}px`;
            this.element.style.top = `${startY + offsetY}px`;

            step++;
            if (step > steps) {
                clearInterval(interval);
                setTimeout(() => this.move(), Math.random() * 4000 + 1000);
            }
        }, 30);

    }

    checkPoints() {
        if (game.hedgehogs.filter(hog => hog instanceof RainbowHedgehog).length >= 20) {
            game.renderHogCard(KarateHedgehog, 'karate-hedgehog-card');
        }
    }
}

const rainbowHedgehogCard = document.getElementById('rainbow-hedgehog-card');
rainbowHedgehogCard.addEventListener('click', (e) => {
    game.buyHedgehog(RainbowHedgehog, e.currentTarget.id);
});

class KarateHedgehog extends Hedgehog {
    static basePrice = 100000;
    static type = "Karate Hedgehog";
    constructor() {
        super(10000, KarateHedgehog.basePrice, './KarateHedgehog.png');
    }
    attachToElement(element) {
        this.element = element;
        this.startMoving();
    }
    startMoving() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;
        const randomX = Math.floor(Math.random() * (fieldWidth - 64));
        const randomY = Math.floor(Math.random() * (fieldHeight - 64));
        this.element.style.left = randomX + 'px';
        this.element.style.top = randomY + 'px';
        this.move();
    }
    //TODO: Create unique movement. I made a flying karate kick hog
    move() {
        const fieldHeight = hogField.clientHeight;
        const fieldWidth = hogField.clientWidth;

        const x = parseInt(this.element.style.left) || 0;
        const y = parseInt(this.element.style.top) || 0;

        let newX = x + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
        if (newX > fieldWidth - 64) {
            newX = fieldWidth - 64;
        }
        else if (newX < 0) {
            newX = 0;
        }
        let newY = y + (Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100);
        if (newY > fieldHeight - 64) {
            newY = fieldHeight - 64;
        }
        else if (newY < 0) {
            newY = 0;
        }

        //switch image to flying kick
        this.element.src = "./KarateKickHedgehog.png";

        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';

        //This needs to match the transition speed
        setTimeout(() => {
            this.element.src = './KarateHedgehog.png';
        }, 1000);


        const randomTime = (Math.random() * 8500) + 1500;
        setTimeout(() => {
            this.move();
        }, randomTime);
    }
    checkPoints() {
        //Currently none as there are no others at the moment
    }
}
const karateHedgehogCard = document.getElementById('karate-hedgehog-card');
karateHedgehogCard.addEventListener('click', (e) => {
    game.buyHedgehog(KarateHedgehog, e.currentTarget.id);
});

const game = new Game(100000);
game.loadGame();
setInterval(() => {
    game.saveGame();
}, 5000); // Save every 5 seconds