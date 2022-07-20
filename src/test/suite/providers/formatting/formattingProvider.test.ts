import * as assert from 'assert';

suite('FormattingProvider', () => {
    test('One command code regex', () => {
        const oneCommand = 'ifnotexist';
        const regex = new RegExp('^(?:{|}|\\s)*' + oneCommand + '\\b(.*)');

        assert.match(oneCommand, regex, 'command on its own');
        assert.match(
            '}' + oneCommand,
            regex,
            'command with leading close curve brace',
        );
        assert.match(
            '{' + oneCommand,
            regex,
            'command with leading open curve brace',
        );
        assert.doesNotMatch(
            `'${oneCommand}'`,
            regex,
            'command wrapped in quotes',
        );
        assert.doesNotMatch(
            `str = command '${oneCommand}' in text line`,
            regex,
            'command in text line',
        );
    });
});
