import data from './content.md';

function export_html(input) {
    let converter = new showdown.Converter();
    let html = converter.makeHtml(input);

    return html;
}

export_html(data);