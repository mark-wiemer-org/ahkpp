;@AHK++AlignAssignmentOn
a          = 5 ; number five
str        = legacy text = with equal symbol
inputFile := "movie.mkv"
;comment with assign operator =
abc       := "abc" ; string
abc       := a + b
;@AHK++AlignAssignmentOff

{
    ;@AHK++AlignAssignmentOn
    a := 5
    ;@AHK++AlignAssignmentOff
}

;@AHK++AlignAssignmentOn
;@AHK++AlignAssignmentOff

;@AHK++AlignAssignmentOn
;Comment must be not deleted
