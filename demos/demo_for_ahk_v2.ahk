function()
return
function()
{
    bool := true
    str := "string"
    int := 123
    float := 123.456

    emptyArray := []
    smallArray := [1, 2, { str: "string" }]
    bigArray := []
    Loop 150  {
        bigArray.push(A_Index)
    }

    obj := { str: str, int: int, float: float }
    objobj := { str: str, obj: obj }
    objobjobj := { str: str, int: int, obj: { str: str, obj: obj } }

    circular := {}
    circular.circular := circular
    instance := Cls.new()

    enum := obj.ownProps()
}
class Cls
{
    str := "string"
    num := 123
    static obj := { str: "string", num: 123 }
    propertyName[] {
        set {
            this.propertyName_ := value
        }
        get {
            return this.propertyName_
        }
    }
    method() {
    }
    static staticMethod() {
    }
}