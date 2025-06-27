import { Component, OnInit } from '@angular/core';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { ActivatedRoute } from '@angular/router';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-view-recipe',
  imports: [TextareaModule, ImageModule],
  templateUrl: './view-recipe.component.html',
  styleUrl: './view-recipe.component.scss',
})
export class ViewRecipeComponent implements OnInit {
  recipe: IRecipe = {
    id: 1,
    coverImage: {
      url: '',
    },
    coverImageUrl: 'assets/images/homepage.jpg',
    title: 'Recipe 1',
    slug: 'recipe 1',
    preparation:
      'Reteta de saratele cu branza este minunata atunci cand avem pofta de gustare. Ceva usor sarat, crocant, cu gust de branza. Mi-au venit in gand saratelele noastre romanesti, facute cu branza telemea, absolut delicioase. Am gasit cateva retete, insa niciuna nu a fost pe placul meu. Am cerut si retetele catorva prietene, insa nici acelea nu m-au convins foarte tare. Asa ca am luat un pix si-o foaie si m-am apucat sa modific retetele pentru a scoate o reteta de saratele cu branza pe placul meu.Am redus cantitatea de unt, am marit-o pe cea de branza, am mai adaugat un ou.  Am omis drojdia pentru ca n-am considerat-o necesara si n-am pus nici praf de copt. Am testat reteta pentru a vedea ce am obtinut. Rezultatul mi-a depasit asteptarile. Am obtinut niste saratele delicioase, usor crocante, fragede si care creeaza dependenta. Cresc foarte frumos datorita untului si sunt extrem de gustoase. Si pentru ca am fost foarte incantata de aceste saratele cu branza, am zis sa impartasesc si cu voi aceasta reteta.',
    ingredients: [
      {
        name: 'ingr1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        quantity: '1 spoon',
      },
    ],
    images: [],
    imagesUrls: ['assets/images/homepage.jpg'],
    preparationTime: {
      hour: '2',
      minutes: '2',
    },
  };

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    //TODO search recipe
  }
}
