function PhysicalKeyboard()
{
    this._initialize();
}

PhysicalKeyboard.prototype._initialize = function()
{
    this.eventCount = 0;
    this.currentEventId = 0;

    this.baseX = 77.0;
    this.baseY = 88.0;
    this.scalar = 50.0;
    this.currentPositionX = this.baseX;
    this.currentPositionY = this.baseY;
    this.keyboard = new Keyboard();

    this.virtualButtons = new Map();
    this.virtualButtons.set(87, "#btnX");
    this.virtualButtons.set(65, "#btnY");
    this.virtualButtons.set(83, "#btnB");
    this.virtualButtons.set(68, "#btnA");
    this.virtualButtons.set(13, "#btnSTART");
    this.virtualButtons.set(16, "#btnSELECT");
    
    this.arrowKeys = new Map();
    this.arrowKeys.set(37, "Left");
    this.arrowKeys.set(38, "Up");
    this.arrowKeys.set(39, "Right");
    this.arrowKeys.set(40, "Down");
    this.isTouching = false;

    this.directionContainer = document.getElementById("dirContainer");
    window.onkeydown = this._onKeyDown.bind(this);
    window.onkeyup = this._onKeyUp.bind(this);

    this.updateDeltaTime = 50.0;
    setTimeout(this._update.bind(this), this.updateDeltaTime);
};

PhysicalKeyboard.prototype._onKeyDown = function(eventArgs)
{
    this.keyboard.onKeyDown(eventArgs.keyCode);

    if(this.virtualButtons.has(eventArgs.keyCode))
    {
        var button = this.virtualButtons.get(eventArgs.keyCode);
        $(button).trigger("touchstart");
    }
    else if(this.arrowKeys.has(eventArgs.keyCode))
    {
        if(this.isTouching)
            return;

        this.isTouching = true;

        if(eventArgs.keyCode == 37)
        {
            this.currentPositionX = this.baseX - this.scalar;
            this.currentPositionY = this.baseY;
            this._dispatchTouchStartEvent(this.currentPositionX, this.currentPositionY);
        }
        else if(eventArgs.keyCode == 38)
        {
            this.currentPositionX = this.baseX;
            this.currentPositionY = this.baseY - this.scalar;
            this._dispatchTouchStartEvent(this.currentPositionX, this.currentPositionY);
        }
        else if(eventArgs.keyCode == 39)
        {
            this.currentPositionX = this.baseX + this.scalar;
            this.currentPositionY = this.baseY;
            this._dispatchTouchStartEvent(this.currentPositionX, this.currentPositionY);
        }
        else if(eventArgs.keyCode == 40)
        {
            this.currentPositionX = this.baseX;
            this.currentPositionY = this.baseY + this.scalar;
            this._dispatchTouchStartEvent(this.currentPositionX, this.currentPositionY);
        }
    }
};
PhysicalKeyboard.prototype._onKeyUp = function(eventArgs)
{
    this.keyboard.onKeyUp(eventArgs.keyCode);

    if(this.virtualButtons.has(eventArgs.keyCode))
    {
        var button = this.virtualButtons.get(eventArgs.keyCode);
        $(button).trigger("touchend");
    }
    else if(this.arrowKeys.has(eventArgs.keyCode))
    {
        this.isTouching = false;
        this._dispatchTouchEndEvent(0, 0);
    }
};

PhysicalKeyboard.prototype._createTouchEvent = function(eventType, identifier, x, y)
{
    var directionContainer = this.directionContainer;
    const touch = new Touch(
        {
            identifier: identifier,
            target: directionContainer,
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
            radiusX: 0,
            radiusY: 0,
            rotationAngle: 0,
            force: 0.5,
        }
    );

    const touchEvent = new TouchEvent(
        eventType, 
        {
            cancelable: true,
            bubbles: true,
            touches: [touch],
            targetTouches: [],
            changedTouches: [touch],
        }
    );

    return touchEvent;
};

PhysicalKeyboard.prototype._dispatchTouchStartEvent = function(x, y)
{
    this.currentEventId = this.eventCount++;
    var touchEvent = this._createTouchEvent("touchstart", this.currentEventId, x, y);
    this.directionContainer.dispatchEvent(touchEvent);
};
PhysicalKeyboard.prototype._dispatchTouchMoveEvent = function(x, y)
{
    var touchEvent = this._createTouchEvent("touchmove", this.currentEventId, x, y);
    this.directionContainer.dispatchEvent(touchEvent);
};
PhysicalKeyboard.prototype._dispatchTouchEndEvent = function(x, y)
{
    var touchEvent = this._createTouchEvent("touchend", this.currentEventId, x, y);
    this.directionContainer.dispatchEvent(touchEvent);
};

PhysicalKeyboard.prototype._update = function()
{
    setTimeout(this._update.bind(this), this.updateDeltaTime);
    if(!this.isTouching)
        return;

    var directionX = 0.0;
    var directionY = 0.0;
    if(this.keyboard.isKeyDown(37))
    {
        directionX -= 1.0;
    }
    if(this.keyboard.isKeyDown(38))
    {
        directionY -= 1.0;
    }
    if(this.keyboard.isKeyDown(39))
    {
        directionX += 1.0;
    }
    if(this.keyboard.isKeyDown(40))
    {
        directionY += 1.0;
    }

    this.currentPositionX = this.baseX + directionX * this.scalar;
    this.currentPositionY = this.baseY + directionY * this.scalar;
    this._dispatchTouchMoveEvent(this.currentPositionX, this.currentPositionY);
};