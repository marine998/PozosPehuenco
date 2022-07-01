const express = require('express');
const router = express.Router();

const passport = require('passport');
const pool = require('../database');
const helpers = require('../lib/helpers');


//SIGNUP
router.get('/signup', (req, res) => {
    res.render('Profile.html')

});


router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile.html',
    failureRedirect: '/signup.html',
    failureFlash: true
}));

// SINGIN
router.get('/signin', (req, res) => {
    res.render('/home.html');
});

router.post('/signin', (req, res, next) => {

    passport.authenticate('local.signin', {
        successRedirect: '/Profile.html',
        failureRedirect: '/home.html',
        failureFlash: true
    })(req,res, next);
});

router.get('/Profile.html', (req, res) => {
    res.render('/Profile.html');
});

router.post('/editarPerfil', async (req, res, next) => {

    const { nombre_editar } = req.body;
    const { apellido_editar } = req.body;
    const { numero_telefono_editar } = req.body;
    const { direccion_editar } = req.body;
    const { correo_electronico_editar } = req.body;
 // pool.query('UPDATE usuario SET nombre = ?, apellido = ?, numero_telefono = ?, direccion = ? Where correo_electronico = ?',[nombre_editar],[apellido_editar],[numero_telefono_editar],[direccion_editar],[correo_electronico_editar]);
    await pool.query('UPDATE usuario SET nombre = ?, apellido = ?, numero_telefono = ?, direccion = ? WHERE correo_electronico = ?',[nombre_editar,apellido_editar,numero_telefono_editar,direccion_editar,correo_electronico_editar]);
    req.flash('success','Actualizado Correctamente')
    res.redirect('/Profile.html');
    
});

router.post('/addProyect', async (req, res, next) => {
    
    const {nombre_proyecto,ubicacion,descripcion,correo_electronico} = req.body;

    const newProyect = {
        nombre_proyecto,
        ubicacion,
        descripcion,
        correo_electronico
    };
    console.log(newProyect.correo_electronico);
    await pool.query('INSERT INTO proyecto SET ?', [newProyect]);
/*     const proyects = await pool.query('SELECT * FROM proyecto WHERE correo_electronico = ?',[newProyect.correo_electronico])  */

    res.redirect('/Myprojects.html');

});
router.get('/Myprojects.html', async (req, res) => {
    const proyects = await pool.query('SELECT * FROM proyecto where correo_electronico = ?',[req.user.correo_electronico]) 
    res.render('Myprojects.html', {proyects});

});

router.post('/deleteProyect', async (req, res, next) => {
    
    
    const { id_proyecto }= req.body;
    await pool.query('DELETE FROM proyecto WHERE id_proyecto = ?', [id_proyecto]);
    console.log(id_proyecto);
    req.flash('success','borrado')

    res.redirect('/Myprojects.html');

});

router.post('/updateProyect', async (req, res, next) => {
    
    const {nombre_proyecto} = req.body;
    const {ubicacion} = req.body;
    const {descripcion} = req.body;
    const { id_proyecto }= req.body;
/*     console.log('UPDATE proyecto SET nombre_proyecto = ?, ubicacion = ?, descripcion = ? WHERE id_proyecto = ?', [nombre_proyecto],[ubicacion],[descripcion],[id_proyecto]);
 */
    await pool.query('UPDATE proyecto SET nombre_proyecto = ?, ubicacion = ?, descripcion = ? WHERE id_proyecto = ?', [nombre_proyecto,ubicacion,descripcion,id_proyecto]);
    
/* console.log('UPDATE proyecto SET nombre_proyecto = ?, ubicacion = ?, descripcion = ? WHERE id_proyecto = ?', [nombre_proyecto],[ubicacion],[descripcion],[id_proyecto]);
 */
    res.redirect('/Myprojects.html');

});


router.post('/chgPassword', async(req, res, next) => {

    const { correo_electronico } = req.body;
    const { actual_password } = req.body;
    const { new_password } = req.body;


    const rows = await pool.query('SELECT * FROM usuario WHERE correo_electronico = ?', [correo_electronico]);
  
    if (rows.length > 0){
        const user = rows[0];
        const validPassword = await helpers.matchPassword(actual_password, user.contrasena );

        if (validPassword) {
            await pool.query('UPDATE usuario SET contrasena = ? WHERE correo_electronico = ?',[await helpers.encryptPassword(new_password),correo_electronico]);
            console.log('1');
            req.flash('success','Constraseña actualizada');
            
            
        } else {
            console.log('2');
            req.flash('message','Constraseña incorrecta');

        }
    } else {
        console.log('3');

    }
    res.redirect('ChgPassword.html');
});

router.post('/cotizacion', async (req, res) => {
   
 /* const filename = `cotizacionn`+${Date.now()}+`.pdf` */
    /* const doc = new PDF({bufferPages: true});
   
    const filename = 'cotizacion.pdf'
    const stream   = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-disposition': 'attachment;filename=pdfarchivo'
    });
 

    doc.on( 'data', (data) => {stream.write(data)});
    doc.on( 'end', () => {stream.end()}); */
     

});
router.get('/Proyect.html/:id', async (req, res) => {


    const proyect = await pool.query('SELECT * FROM proyecto where id_proyecto = ?',[req.params.id]); 
    res.render('Proyect.html', {proyect});


});
/* router.get('/logout', async (req, res) => {
    req.logOut();
    res.redirect('/Home.html')

}); */
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/Home.html')

    });
  });



module.exports = router;