import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../shared/services/device.service';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipesService } from '../shared/services/recipes.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, RouterModule, RecipeCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  isMobile!: boolean;

  recommendedRecipes: IRecipe[] = [];

  constructor(
    private readonly deviceService: DeviceService,
    private readonly recipesService: RecipesService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.recommendedRecipes = [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
    ];

    // this.recipesService
    //   .getRecommendedRecipes()
    //   .pipe(untilDestroyed(this))
    //   .subscribe((recipes) => {
    //     this.recommendedRecipes = [...recipes];
    //   });
  }
}
