import { Directive, ElementRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Directive({
    selector: '[textEditor]',
    host: {
        '(keyup)': 'onKeyup()',
        '(selectstart)': 'onSelectStart',
        '(mouseup)': 'onMouseup'
    }
})
export class TextEditor {
    @Input('textEditor') model: string;
    @Output('contenteditableModelChange') update = new EventEmitter();

    /**
     * By updating this property on keyup, and checking against it during
     * ngOnChanges, we can rule out change events fired by our own onKeyup.
     * Ideally we would not have to check against the whole string on every
     * change, could possibly store a flag during onKeyup and test against that
     * flag in ngOnChanges, but implementation details of Angular change detection
     * cycle might make this not work in some edge cases?
     */
    private lastViewModel: string;

    constructor(private elRef: ElementRef) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['model'] && changes['model'].currentValue !== this.lastViewModel) {
            this.lastViewModel = this.model;
            this.refreshView();
        }
    }

    /**
     * On Text Select Start Event
     */
    onSelectStart() {
        console.log('hello')
    }

    /** This should probably be debounced. */
    onKeyup() {
        var value = this.elRef.nativeElement.innerText;
        this.lastViewModel = value;
        this.update.emit(value);
    }

    onMouseup() {
        console.log('mouse Up')
    }

    private refreshView() {
        this.elRef.nativeElement.innerText = this.model
    }
}