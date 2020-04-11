
; msgbox(A_DebuggerName)
global GlobalVar := "Global"
function()
return
function()
{
	str := "string"
	int := 123
	float := 123.456

	emptyArray := []
	smallArray := [1, 2, { str: "string" }]
	bigArray := []
	Loop 150 {
		bigArray.push(A_Index)
	}

	obj := { str: str, int: int, float: float }
	objobj := { str: str, obj: obj }
	objobjobj := { str: str, int: int, obj: { str: str, obj: obj } }

	circular := {}
	circular.circular := circular
	instance := new Cls()

	enum := obj._NewEnum()
}
Array(params*)
{
	params.isArray := true
	return params
}
class Cls
{
	instanceVar := "instance"
	static str := "string"
	static num := 123
	static obj := { str: "string", int: 123, float: 123.456 }
	property[] {
		get {
		}
	}
	method() {
	}
}
