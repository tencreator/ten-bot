interface WordDetails {
    bad: boolean
    tested: Record<string, string>
}

interface FilterResult {
    input: string
    rep: string
    threshold: number
    words: Record<string, WordDetails>
    filtered: string
}

class Filter {
    constructor() {
        this.filter = this.filter.bind(this)
    }
    
    private levenshtein(str1: string, str2: string): number {
        const len1 = str1.length, len2 = str2.length
        const matrix: number[][] = []

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i]
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,    // Deletion
                    matrix[i][j - 1] + 1,    // Insertion
                    matrix[i - 1][j - 1] + cost  // Substitution
                )
            }
        }
        return matrix[len1][len2]
    }

    private similarity(str1: string, str2: string): number {
        const levDistance = this.levenshtein(str1, str2)
        const maxLength = Math.max(str1.length, str2.length)
        return 1.0 - (levDistance / maxLength)
    }

    private stripSuffix(word: string, suffixes: string[]): string {
        for (const suffix of suffixes) {
            if (word.endsWith(suffix)) {
                return word.slice(0, -suffix.length)
            }
        }
        return word
    }

    filter(
        msg: string, 
        replacer: string = '*', 
        bad: string[], 
        whitelist: string[], 
        threshold: number = 0.8, 
        suffixes: string[]
    ): FilterResult {

        const words: string[] = []
        const separators: string[] = []
        const wordDetails: Record<string, WordDetails> = {}

        const regex = /([\w]+)([^\w]*)/g
        let match: RegExpExecArray | null

        while ((match = regex.exec(msg)) !== null) {
            words.push(match[1])
            separators.push(match[2])
        }

        for (let i = 0; i < words.length; i++) {
            const word = words[i]
            const rootWord = this.stripSuffix(word.toLowerCase(), suffixes)
            let isBad = false
            const tests: Record<string, string> = {}

            for (const badWord of bad) {
                const sim = this.similarity(rootWord, badWord.toLowerCase())
                tests[badWord] = sim.toFixed(2)

                if (sim >= threshold) {
                    isBad = true
                }
            }

            for (const whiteWord of whitelist) {
                if (word.toLowerCase() === whiteWord.toLowerCase()) {
                    isBad = false
                }
            }

            wordDetails[word] = {
                bad: isBad,
                tested: tests
            }

            if (isBad) {
                words[i] = replacer.repeat(word.length)
            }
        }

        const resultStr = words.map((word, index) => word + (separators[index] || "")).join("")

        return {
            input: msg,
            rep: replacer,
            threshold: threshold,
            words: wordDetails,
            filtered: resultStr
        }
    }
}

export default Filter
export { Filter, WordDetails, FilterResult }