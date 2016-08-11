const parseRC = (content) => {
    const lines = content.split("\n"),
        sections = {};

    let line, currentSection;
    // need deterministic iteration to know which site we're in
    for(let l = 0; l < lines.length; ++l) {
        line = lines[l];
        if(line.startsWith("[")) {
            currentSection = line.substr(1, line.length - 2);
            sections[currentSection] = {};
        }
        else if(line.includes("=")) {
            const [ property, ...content ] = line.split("=");
            content[0] = content[0].trimLeft();

            sections[currentSection][property.trim()] = content.join("=");
        }
    }

    return sections;
};

export default parseRC;
