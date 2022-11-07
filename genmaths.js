// Equivalent à randint en python
function randint(a, b) {
    console.assert(Number.isInteger(a) && Number.isInteger(b) && b >= a);
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Equivalent à choice en python
function choice(l) {
    console.assert(l.length > 0);
    let i = randint(0, l.length - 1);
    return l[i];
}


// Les différentes opérations possibles
// On rajoute le suffixe EL pour "en ligne", à opposer aux autres opérations, posées par défaut
class Operation {
    static ADD = new Operation();
    static ADD_EL = new Operation();
    static SOUS = new Operation();
    static SOUS_EL = new Operation();
    static MUL = new Operation();
    static MUL_EL = new Operation();
    static DIV = new Operation();
}

/*
Il existe trois modes pour déterminer les opérandes :
    - nb_chiffres : soit le calcul ne fait intervenir que 2 opérandes, auquel cas on peut renseigner
      directement le nombre de chiffres de chaque nombre
    - nb_max : ou alors on peut renseigner un nb_max, les opérandes seront choisies entre 1 et nb_max
      (c'est le mode obligatoire pour des additions à plus de 2 opérandes)
    - le dernier mode est propre aux multiplications en ligne : dans ce mode on choisit
      explicitement les tables que l'on fait réviser.

Pour les deux premiers modes, ces informations sont contenues dans un tuple 
n_tailles de la forme (bool, int, int ?) :
    - n_tailles[0] vaut True si on renseigne explicitement le nombre de chiffres des 2 étages
      dans tailles[1] et tailles[2]
    - sinon on renseigne nb_max dans tailles[1].
*/


// Si l'on renseigne le nombre de chiffres de chaque opérande
// Il y a nécessairement 2 opérandes
function creer_calcul_nb_chiffres(op, n_chiffres_1, n_chiffres_2) {
    // Soustraction possible (dans N)
    console.assert((op != Operation.SOUS && op != Operation.SOUS_EL && op != Operation.DIV) || n_chiffres_1 >= n_chiffres_2);
    console.assert(n_chiffres_1 > 0 && n_chiffres_2 > 0);

    let n1 = randint(10 ** (n_chiffres_1 - 1), 10 ** n_chiffres_1 - 1);
    let n2 = randint(10 ** (n_chiffres_2 - 1), 10 ** n_chiffres_2 - 1);

    if (op == Operation.SOUS || op == Operation.SOUS_EL || op == Operation.DIV) {
        return [Math.max(n1, n2), Math.min(n1, n2)];
    }
    return [n1, n2];
}


function creer_calcul_nb_max(op, nb_max, n_operandes) {
    // Le nombre d'opérandes est 2 excepté potentiellement pour les additions
    console.assert(n_operandes == 2 || (op == Operation.ADD && n_operandes >= 2));
    console.assert(nb_max > 1);

    let nb = (Array(n_operandes).fill(0)).map(_ => randint(1, nb_max));
    if (op == Operation.SOUS || op == Operation.SOUS_EL || op == Operation.DIV) {
        return [Math.max(nb), Math.min(nb)];
    }
    return nb;
}


function creer_calcul(op, n_tailles, n_operandes) {
    // n_tailles[0] vaut True si on renseigne explicitement le nombre de chiffres des 2 étages
    // dans tailles[1] et tailles[2]
    // sinon on renseigne nb_max dans tailles[1]
    if (n_tailles[0]) {
        let n_chiffres_1 = n_tailles[1];
        let n_chiffres_2 = n_tailles[2];
        return creer_calcul_nb_chiffres(op, n_chiffres_1, n_chiffres_2);
    } else {
        let nb_max = n_tailles[1];
        return creer_calcul_nb_max(op, nb_max, n_operandes);
    }
}


// MUL_EL forcément avec restriction
function creer_mul_el(tables) {
    console.assert(tables.length > 0)
    // On ne multiplie pas par 1
    let n1 = randint(2, 9);
    let n2 = randint(2, choice(tables));
    return [n1, n2];
}


function filtrer_calcul(c, op) {
    // Pour éliminer les calculs jugés inintéressants selon les critères ci-dessous
    let b = true;
    if (op == Operation.SOUS || op == Operation.SOUS_EL) {
        // On enlève au moins 3 et résultat plus grand que 1
        b = c[1] > 2 && c[0] - c[1] > 1;
    } else if (op == Operation.MUL || op == Operation.MUL_EL) {
        b = c[0] > 1 && c[1] > 1
    } else if (op == Operation.DIV) {
        b = Math.floor(c[0] / c[1]) > 1
    } else { // Sinon addition
        c.forEach(x => { b = b && x > 0 });
    }
    return b;
}


function creer_calculs(N, op, n_tailles, n_operandes, tables) {
    let calculs = [];
    while (calculs.length < N) {
        let c = [];
        if (op == Operation.MUL_EL) {
            c = creer_mul_el(tables);
        } else {
            c = creer_calcul(op, n_tailles, n_operandes);
        }
        if (filtrer_calcul(c, op)) {
            calculs.push(c);
        }
    }
    return calculs;
}
