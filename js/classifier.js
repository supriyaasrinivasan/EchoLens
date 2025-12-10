

export class ContentClassifier {
    constructor() {
        this.educationalDomains = new Set([
            'youtube.com', 'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org',
            'codecademy.com', 'freecodecamp.org', 'w3schools.com', 'mdn.mozilla.org',
            'stackoverflow.com', 'github.com', 'medium.com', 'dev.to', 'hashnode.com',
            'geeksforgeeks.org', 'tutorialspoint.com', 'programiz.com', 'realpython.com',
            'hackerrank.com', 'leetcode.com', 'codewars.com', 'kaggle.com',
            'towardsdatascience.com', 'arxiv.org', 'scholar.google.com', 'researchgate.net',
            'wikipedia.org', 'britannica.com', 'docs.python.org', 'docs.microsoft.com',
            'developer.mozilla.org', 'reactjs.org', 'angular.io', 'vuejs.org',
            'tensorflow.org', 'pytorch.org', 'scikit-learn.org', 'numpy.org',
            'udacity.com', 'pluralsight.com', 'skillshare.com', 'linkedin.com/learning',
            'brilliant.org', 'duolingo.com', 'memrise.com', 'quizlet.com'
        ]);

        this.categoryKeywords = {
            'Programming': [
                'programming', 'coding', 'developer', 'software', 'algorithm', 'code',
                'function', 'class', 'object', 'variable', 'array', 'loop', 'javascript',
                'python', 'java', 'typescript', 'react', 'angular', 'vue', 'node',
                'api', 'database', 'sql', 'git', 'github', 'debug', 'compile', 'runtime',
                'framework', 'library', 'module', 'package', 'npm', 'pip', 'docker'
            ],
            'Data Science': [
                'data science', 'machine learning', 'deep learning', 'artificial intelligence',
                'neural network', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit',
                'regression', 'classification', 'clustering', 'nlp', 'computer vision',
                'data analysis', 'statistics', 'probability', 'model', 'training',
                'dataset', 'feature', 'prediction', 'accuracy', 'precision', 'recall'
            ],
            'Web Development': [
                'html', 'css', 'javascript', 'frontend', 'backend', 'fullstack',
                'responsive', 'web design', 'ui', 'ux', 'bootstrap', 'tailwind',
                'webpack', 'babel', 'sass', 'less', 'rest', 'graphql', 'websocket',
                'authentication', 'authorization', 'deployment', 'hosting', 'dns'
            ],
            'Mathematics': [
                'mathematics', 'math', 'algebra', 'calculus', 'geometry', 'trigonometry',
                'linear algebra', 'statistics', 'probability', 'discrete math', 'equation',
                'theorem', 'proof', 'integral', 'derivative', 'matrix', 'vector'
            ],
            'Science': [
                'physics', 'chemistry', 'biology', 'science', 'experiment', 'hypothesis',
                'theory', 'atom', 'molecule', 'cell', 'energy', 'force', 'motion',
                'evolution', 'genetics', 'ecology', 'astronomy', 'quantum'
            ],
            'Language': [
                'language', 'grammar', 'vocabulary', 'speaking', 'listening', 'reading',
                'writing', 'pronunciation', 'fluency', 'translation', 'english', 'spanish',
                'french', 'german', 'chinese', 'japanese', 'korean', 'linguistics'
            ],
            'Business': [
                'business', 'marketing', 'finance', 'economics', 'management', 'strategy',
                'entrepreneurship', 'startup', 'investment', 'stock', 'accounting',
                'leadership', 'sales', 'product', 'customer', 'market', 'revenue'
            ],
            'Design': [
                'design', 'graphic design', 'ui design', 'ux design', 'figma', 'sketch',
                'photoshop', 'illustrator', 'typography', 'color theory', 'layout',
                'branding', 'logo', 'illustration', 'animation', 'motion graphics'
            ],
            'DevOps': [
                'devops', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'aws', 'azure',
                'gcp', 'terraform', 'ansible', 'linux', 'bash', 'shell', 'monitoring',
                'logging', 'deployment', 'infrastructure', 'cloud', 'microservices'
            ],
            'Security': [
                'security', 'cybersecurity', 'hacking', 'penetration testing', 'encryption',
                'authentication', 'authorization', 'firewall', 'malware', 'vulnerability',
                'ssl', 'https', 'oauth', 'jwt', 'xss', 'sql injection', 'csrf'
            ]
        };

        this.educationalPatterns = [
            /\/tutorial/i, /\/guide/i, /\/learn/i, /\/course/i, /\/lesson/i,
            /\/documentation/i, /\/docs/i, /\/api/i, /\/reference/i,
            /\/howto/i, /\/how-to/i, /\/getting-started/i, /\/introduction/i,
            /\/beginner/i, /\/advanced/i, /\/intermediate/i,
            /\/chapter/i, /\/module/i, /\/unit/i, /\/lecture/i,
            /\/exercise/i, /\/practice/i, /\/quiz/i, /\/test/i,
            /\/example/i, /\/sample/i, /\/demo/i
        ];

        this.nonEducationalPatterns = [
            /\/cart/i, /\/checkout/i, /\/payment/i, /\/order/i,
            /\/login/i, /\/signup/i, /\/register/i, /\/account/i,
            /\/settings/i, /\/profile/i, /\/dashboard/i,
            /\/news/i, /\/entertainment/i, /\/gossip/i,
            /\/shop/i, /\/store/i, /\/product/i, /\/buy/i
        ];

        this.videoEducationalPatterns = [
            /tutorial/i, /course/i, /lesson/i, /lecture/i, /learn/i,
            /how to/i, /explained/i, /introduction/i, /beginner/i,
            /guide/i, /crash course/i, /full course/i, /masterclass/i,
            /coding/i, /programming/i, /development/i
        ];
    }

    
    async classifyUrl(url, title = '') {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            const path = urlObj.pathname.toLowerCase();
            const fullText = `${title} ${path}`.toLowerCase();

            const domainScore = this.checkEducationalDomain(domain);

            const patternScore = this.checkUrlPatterns(path);

            const keywordAnalysis = this.analyzeKeywords(fullText);

            const educationalScore = this.calculateEducationalScore(
                domainScore, 
                patternScore, 
                keywordAnalysis.score
            );

            const isEducational = educationalScore >= 0.5;

            const topics = this.extractTopics(fullText, keywordAnalysis.category);

            return {
                isEducational,
                confidence: educationalScore,
                category: keywordAnalysis.category || 'General Learning',
                topics: topics,
                domain: domain,
                scores: {
                    domain: domainScore,
                    pattern: patternScore,
                    keyword: keywordAnalysis.score
                }
            };
        } catch (error) {
            console.error('Classification error:', error);
            return {
                isEducational: false,
                confidence: 0,
                category: 'Unknown',
                topics: [],
                domain: '',
                scores: { domain: 0, pattern: 0, keyword: 0 }
            };
        }
    }

    checkEducationalDomain(domain) {
        if (this.educationalDomains.has(domain)) {
            return 1.0;
        }

        for (const eduDomain of this.educationalDomains) {
            if (domain.endsWith('.' + eduDomain)) {
                return 0.9;
            }
        }

        if (domain.endsWith('.edu') || domain.endsWith('.ac.uk') || domain.endsWith('.edu.au')) {
            return 0.95;
        }

        return 0;
    }

    checkUrlPatterns(path) {
        for (const pattern of this.nonEducationalPatterns) {
            if (pattern.test(path)) {
                return -0.5;
            }
        }

        let score = 0;
        for (const pattern of this.educationalPatterns) {
            if (pattern.test(path)) {
                score += 0.3;
            }
        }

        return Math.min(score, 1.0);
    }

    analyzeKeywords(text) {
        const words = text.toLowerCase().split(/\W+/);
        const categoryScores = {};

        for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
            let matches = 0;
            for (const keyword of keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    matches++;
                }
            }
            categoryScores[category] = matches / keywords.length;
        }

        let bestCategory = null;
        let bestScore = 0;

        for (const [category, score] of Object.entries(categoryScores)) {
            if (score > bestScore) {
                bestScore = score;
                bestCategory = category;
            }
        }

        const totalMatches = Object.values(categoryScores).reduce((a, b) => a + b, 0);
        const keywordScore = Math.min(totalMatches * 2, 1.0);

        return {
            category: bestCategory,
            score: keywordScore,
            categoryScores: categoryScores
        };
    }

    calculateEducationalScore(domainScore, patternScore, keywordScore) {
        const weights = {
            domain: 0.4,
            pattern: 0.3,
            keyword: 0.3
        };

        let score = 
            domainScore * weights.domain +
            Math.max(patternScore, 0) * weights.pattern +
            keywordScore * weights.keyword;

        if (domainScore >= 0.9) {
            score = Math.max(score, 0.7);
        }

        if (patternScore < 0) {
            score *= 0.5;
        }

        return Math.max(0, Math.min(1, score));
    }

    extractTopics(text, category) {
        const topics = new Set();
        const words = text.toLowerCase();

        if (category) {
            topics.add(category);
        }

        const specificTopics = {
            'JavaScript': ['javascript', 'js', 'node.js', 'nodejs', 'npm'],
            'Python': ['python', 'pip', 'django', 'flask', 'pandas', 'numpy'],
            'React': ['react', 'reactjs', 'redux', 'jsx'],
            'Machine Learning': ['machine learning', 'ml', 'neural network', 'deep learning'],
            'SQL': ['sql', 'mysql', 'postgresql', 'database'],
            'Docker': ['docker', 'container', 'kubernetes', 'k8s'],
            'Git': ['git', 'github', 'gitlab', 'version control'],
            'CSS': ['css', 'sass', 'less', 'tailwind', 'bootstrap'],
            'HTML': ['html', 'html5', 'dom'],
            'TypeScript': ['typescript', 'ts'],
            'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
            'API': ['api', 'rest', 'restful', 'graphql'],
            'Testing': ['testing', 'unit test', 'jest', 'mocha', 'cypress'],
            'Security': ['security', 'authentication', 'encryption', 'oauth']
        };

        for (const [topic, keywords] of Object.entries(specificTopics)) {
            for (const keyword of keywords) {
                if (words.includes(keyword)) {
                    topics.add(topic);
                    break;
                }
            }
        }

        return Array.from(topics).slice(0, 5);
    }

    
    classifyVideo(title, description = '') {
        const text = `${title} ${description}`.toLowerCase();

        let score = 0;
        for (const pattern of this.videoEducationalPatterns) {
            if (pattern.test(text)) {
                score += 0.2;
            }
        }

        const keywordAnalysis = this.analyzeKeywords(text);
        score += keywordAnalysis.score * 0.5;

        return {
            isEducational: score >= 0.4,
            confidence: Math.min(score, 1.0),
            category: keywordAnalysis.category,
            topics: this.extractTopics(text, keywordAnalysis.category)
        };
    }

    
    async classifyContent(pageData) {
        return await this.classifyWithContent(pageData.url, pageData.title, pageData);
    }

    async classifyWithContent(url, title, pageData) {
        const baseClassification = await this.classifyUrl(url, title);

        let contentBoost = 0;

        if (pageData.codeBlocks > 0) {
            contentBoost += Math.min(pageData.codeBlocks * 0.05, 0.2);
        }

        if (pageData.videos > 0) {
            contentBoost += 0.1;
        }

        if (pageData.headings && pageData.headings.length > 3) {
            contentBoost += 0.1;
        }

        if (pageData.wordCount > 1000) {
            contentBoost += 0.1;
        }

        if (pageData.readingTime > 5) {
            contentBoost += 0.05;
        }

        const enhancedConfidence = Math.min(
            baseClassification.confidence + contentBoost,
            1.0
        );

        const headingTopics = [];
        if (pageData.headings) {
            for (const heading of pageData.headings) {
                const extracted = this.extractTopics(heading.text, baseClassification.category);
                headingTopics.push(...extracted);
            }
        }

        return {
            ...baseClassification,
            confidence: enhancedConfidence,
            isEducational: enhancedConfidence >= 0.5,
            topics: [...new Set([...baseClassification.topics, ...headingTopics])].slice(0, 7),
            contentSignals: {
                codeBlocks: pageData.codeBlocks,
                videos: pageData.videos,
                headingCount: pageData.headings?.length || 0,
                wordCount: pageData.wordCount,
                readingTime: pageData.readingTime
            }
        };
    }
}
