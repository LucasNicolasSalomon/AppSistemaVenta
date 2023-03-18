import { Component, OnInit, AfterViewInit,ViewChild} from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ModalProductoComponent } from '../../Modales/modal-producto/modal-producto.component';
import { Producto } from 'src/app/Interfaces/producto';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import { Categoria } from 'src/app/Interfaces/categoria';
import { CategoriaService } from 'src/app/Services/categoria.service';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';

import Swal from 'sweetalert2';
import { elements } from 'chart.js';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit,AfterViewInit{

  formularioModificar: FormGroup;
  @ViewChild(MatPaginator) paginadorTabla! : MatPaginator;
  columnasTable: string[] = ['nombre','categoria','stock','precio','estado','acciones'];
  dataIncio: Producto[] = [];  
  selectedOption: string ="";
  dataListaProductos = new MatTableDataSource(this.dataIncio);
  listaCategorias: Categoria[]=[];
  opcionesModificacion: any[] = [    
    {value:"todos",descripcion:"Todos"},
    {value:"categoria",descripcion:"Por Categorias"}
  ];
  idProductosModificar: number[] = [];
  productosModificar: Producto[] = []


  constructor(
    
    private fb:FormBuilder,
    private dialog: MatDialog,
    private _productoServicio: ProductoService,
    private _utilidadServicio: UtilidadService,
    private _categoriaServicio: CategoriaService

  ){

    this._categoriaServicio.lista().subscribe({
      next: (data) => {
        if(data.status) this.listaCategorias = data.value
      },
      error:(e) =>{}

    })

    this.formularioModificar = this.fb.group({
      opcion: [''],
      idCategoria: [''],
      porcentaje: [''],
    })

    

  }


  cambioOption(valor: string){
    if(valor == 'todos'){
      this.selectedOption = 'todos';
    }else{
      this.selectedOption = 'categoria';
    }
  }


  obtenerProductos(){
    this._productoServicio.lista().subscribe({
      next: (data) => {
        if(data.status){
          this.dataListaProductos.data= data.value;
        }else{
          this._utilidadServicio.mostrarAlerta("No se encontraron datos","Oops!")
        }
        
      },
      error:(e) =>{}

    })
  }

  ngOnInit(): void {

    this.obtenerProductos();   
    
  }

  ngAfterViewInit(): void {
    this.dataListaProductos.paginator = this.paginadorTabla;
  }

  aplicarFiltroTabla(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaProductos.filter = filterValue.trim().toLocaleLowerCase();
  }

  nuevoProducto(){
    this.dialog.open(ModalProductoComponent,{
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if(resultado == "true") this.obtenerProductos();
    });
  }

  editarProducto(producto:Producto){
    this.dialog.open(ModalProductoComponent,{
      disableClose: true,
      data:producto
    }).afterClosed().subscribe(resultado => {
      if(resultado == "true") this.obtenerProductos();
    });
  }

  eliminarProducto(producto:Producto){
    Swal.fire({
      title: '¿Desea eliminar el producto?',
      text: producto.nombre,
      icon: 'warning',
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor:"#d33",
      cancelButtonText: "No, volver"
    }).then((resultado)=>{

      if(resultado.isConfirmed){

        this._productoServicio.eliminar(producto.idProducto).subscribe({
          next:(data) => {

            if(data.status){
              this._utilidadServicio.mostrarAlerta("El producto fue eliminado","Listo!");
              this.obtenerProductos();
            }else{
              this._utilidadServicio.mostrarAlerta("No se pudo eliminar el producto","Error");
            }
          },
          error:(e) => {}
        })
      }
    })
  }

  modificarPrecios(){

    if(this.formularioModificar.value.porcentaje !== ''){

      Swal.fire({
        title: '¿Desea actualizar los productos?',      
        text: "Actualizara todos los precios de los productos con un  "+ this.formularioModificar.value.porcentaje+ "%",
        icon: 'warning',
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Si, actualizar",
        showCancelButton: true,
        cancelButtonColor:"#d33",
        cancelButtonText: "No, volver"
      }).then((resultado)=>{
  
        if(resultado.isConfirmed){

          var porcentaje = 0;
          var resultadoPorcentaje = 0;
          var precioNuevo = 0;

          if( this.selectedOption == 'todos'){
  
            porcentaje = parseInt(this.formularioModificar.value.porcentaje);
            
            resultadoPorcentaje = (porcentaje / 100) + 1;
          
            this.dataListaProductos.data.forEach(element => {
              
              precioNuevo = parseFloat((parseInt(element.precio) * resultadoPorcentaje).toFixed(0));
  
              const _producto: Producto = {
  
                idProducto: element.idProducto,
                nombre: element.nombre,
                idCategoria: element.idCategoria,
                descripcionCategoria: "",
                precio : precioNuevo.toString(),
                stock: element.stock,
                esActivo: element.esActivo
              }
  
              this._productoServicio.editar(_producto).subscribe({});
              
            });
            
            this.obtenerProductos();
  
          }else if(this.selectedOption == 'categoria'){
            
            porcentaje = parseInt(this.formularioModificar.value.porcentaje);
            
            resultadoPorcentaje = (porcentaje / 100) + 1;

            this.dataListaProductos.data.forEach(element => {

              if(element.idCategoria == this.formularioModificar.value.idCategoria){

                precioNuevo = parseFloat((parseInt(element.precio) * resultadoPorcentaje).toFixed(0));
  
                const _producto: Producto = {
    
                  idProducto: element.idProducto,
                  nombre: element.nombre,
                  idCategoria: element.idCategoria,
                  descripcionCategoria: "",
                  precio : precioNuevo.toString(),
                  stock: element.stock,
                  esActivo: element.esActivo

                }
    
                this._productoServicio.editar(_producto).subscribe({});

                

              }

            })

            this.obtenerProductos();
  
          }else{
            this._utilidadServicio.mostrarAlerta("Ingrese una opcion para modificar","Error");
          }
        }
      })

    }else{
      this._utilidadServicio.mostrarAlerta("Ingrese el porcentaje a aumentar","Error");
    }
   
  }

}
